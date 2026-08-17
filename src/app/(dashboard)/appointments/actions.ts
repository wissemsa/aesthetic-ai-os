"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { AppointmentStatus, AppointmentSource } from "@/types/appointment";

export async function createAppointment(formData: FormData) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const patientId = (formData.get("patient_id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const serviceName = (formData.get("service_name") as string)?.trim() || null;
  const dateStr = (formData.get("date") as string)?.trim();
  const timeStr = (formData.get("time") as string)?.trim();
  const durationMinutes = parseInt((formData.get("duration_minutes") as string) || "30", 10);
  const providerId = (formData.get("provider_id") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const source = ((formData.get("source") as AppointmentSource) || "manual") as AppointmentSource;

  if (!patientId || !title || !dateStr || !timeStr) {
    redirect(
      `/appointments/new?${patientId ? `patient_id=${patientId}&` : ""}error=Please fill in all required fields (Patient, Title, Date, Time)`
    );
  }

  // Validate patient belongs to this clinic
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .eq("id", patientId)
    .eq("clinic_id", ctx.clinicId)
    .single();

  if (patientError || !patient) {
    redirect("/appointments/new?error=Invalid patient selected");
  }

  // Construct start and end timestamp in ISO
  const startDateTime = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(startDateTime.getTime())) {
    redirect("/appointments/new?error=Invalid date or time provided");
  }

  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
  const appointmentId = crypto.randomUUID();

  const { error: insertError } = await supabase.from("appointments").insert([
    {
      id: appointmentId,
      clinic_id: ctx.clinicId,
      patient_id: patientId,
      provider_id: providerId,
      title,
      service_name: serviceName,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_minutes: durationMinutes,
      status: "scheduled",
      source,
      notes,
      created_by: ctx.user.id,
    },
  ]);

  if (insertError) {
    redirect(`/appointments/new?error=${encodeURIComponent(insertError.message)}`);
  }

  // Add activity entry to patient timeline
  const formattedDate = startDateTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      patient_id: patientId,
      type: "system",
      title: "Appointment scheduled",
      content: `${title} scheduled for ${formattedDate} (${durationMinutes} mins)`,
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/appointments/${appointmentId}`);
}

export async function updateAppointment(appointmentId: string, formData: FormData) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const title = (formData.get("title") as string)?.trim();
  const serviceName = (formData.get("service_name") as string)?.trim() || null;
  const dateStr = (formData.get("date") as string)?.trim();
  const timeStr = (formData.get("time") as string)?.trim();
  const durationMinutes = parseInt((formData.get("duration_minutes") as string) || "30", 10);
  const status = (formData.get("status") as AppointmentStatus) || "scheduled";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!title || !dateStr || !timeStr) {
    redirect(`/appointments/${appointmentId}/edit?error=Please provide Title, Date, and Time`);
  }

  const startDateTime = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(startDateTime.getTime())) {
    redirect(`/appointments/${appointmentId}/edit?error=Invalid date or time`);
  }

  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  const { data: updated, error } = await supabase
    .from("appointments")
    .update({
      title,
      service_name: serviceName,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_minutes: durationMinutes,
      status,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("clinic_id", ctx.clinicId)
    .select("patient_id")
    .single();

  if (error) {
    redirect(`/appointments/${appointmentId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  if (updated?.patient_id) {
    revalidatePath(`/patients/${updated.patient_id}`);
  }

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointmentId}`);
  revalidatePath("/dashboard");
  redirect(`/appointments/${appointmentId}`);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  newStatus: AppointmentStatus,
  cancellationReason?: string
) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "cancelled") {
    updateData.cancellation_reason = cancellationReason || "Cancelled by clinic staff";
    updateData.cancelled_at = new Date().toISOString();
    updateData.cancelled_by = ctx.user.id;
  }

  const { data: appointment, error } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", appointmentId)
    .eq("clinic_id", ctx.clinicId)
    .select("patient_id, title, start_time")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create timeline activity
  if (appointment) {
    const statusLabels: Record<AppointmentStatus, string> = {
      scheduled: "scheduled",
      confirmed: "confirmed",
      completed: "completed",
      cancelled: "cancelled",
      no_show: "marked as no-show",
    };

    await supabase.from("activities").insert([
      {
        clinic_id: ctx.clinicId,
        patient_id: appointment.patient_id,
        type: "status_change",
        title: `Appointment ${statusLabels[newStatus]}`,
        content: `Appointment "${appointment.title}" was ${statusLabels[newStatus]}.${
          cancellationReason ? ` Reason: ${cancellationReason}` : ""
        }`,
        performed_by: ctx.user.id,
      },
    ]);

    revalidatePath(`/patients/${appointment.patient_id}`);
  }

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointmentId}`);
  revalidatePath("/dashboard");
}

export async function cancelAppointment(appointmentId: string, reason: string) {
  return await updateAppointmentStatus(appointmentId, "cancelled", reason);
}
