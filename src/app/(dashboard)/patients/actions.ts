"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";

export async function createPatient(formData: FormData) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const dateOfBirth = (formData.get("date_of_birth") as string)?.trim() || null;
  const gender = (formData.get("gender") as string)?.trim() || null;
  const addressLine1 = (formData.get("address_line1") as string)?.trim() || null;
  const addressLine2 = (formData.get("address_line2") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim() || null;
  const postalCode = (formData.get("postal_code") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!firstName || !lastName) {
    redirect("/patients/new?error=First name and Last name are required");
  }

  const patientId = crypto.randomUUID();

  const { error: patientError } = await supabase.from("patients").insert([
    {
      id: patientId,
      clinic_id: ctx.clinicId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      date_of_birth: dateOfBirth,
      gender,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      state,
      postal_code: postalCode,
      country,
      notes,
      created_by: ctx.user.id,
    },
  ]);

  if (patientError) {
    redirect(`/patients/new?error=${encodeURIComponent(patientError.message)}`);
  }

  // Create initial activity log
  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      patient_id: patientId,
      type: "system",
      title: "Patient profile created",
      content: `Patient profile created for ${firstName} ${lastName}`,
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/patients");
  revalidatePath("/dashboard");
  redirect(`/patients/${patientId}`);
}

export async function updatePatient(patientId: string, formData: FormData) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const dateOfBirth = (formData.get("date_of_birth") as string)?.trim() || null;
  const gender = (formData.get("gender") as string)?.trim() || null;
  const addressLine1 = (formData.get("address_line1") as string)?.trim() || null;
  const addressLine2 = (formData.get("address_line2") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim() || null;
  const postalCode = (formData.get("postal_code") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!firstName || !lastName) {
    redirect(`/patients/${patientId}/edit?error=First name and Last name are required`);
  }

  const { error } = await supabase
    .from("patients")
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      date_of_birth: dateOfBirth,
      gender,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      state,
      postal_code: postalCode,
      country,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId)
    .eq("clinic_id", ctx.clinicId);

  if (error) {
    redirect(`/patients/${patientId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  // Create update activity
  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      patient_id: patientId,
      type: "system",
      title: "Patient details updated",
      content: "Patient demographics or contact information was updated.",
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}`);
}

export async function toggleArchivePatient(patientId: string, archive: boolean) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("patients")
    .update({
      is_archived: archive,
      archived_at: archive ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId)
    .eq("clinic_id", ctx.clinicId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      patient_id: patientId,
      type: "system",
      title: archive ? "Patient archived" : "Patient unarchived",
      content: archive
        ? "Patient was moved to the archived registry."
        : "Patient was restored to active status.",
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
}

export async function addPatientNote(patientId: string, formData: FormData) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const content = (formData.get("content") as string)?.trim();
  if (!content) return;

  const { error } = await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      patient_id: patientId,
      type: "note",
      title: "Clinical / Consultation Note",
      content,
      performed_by: ctx.user.id,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/patients/${patientId}`);
}
