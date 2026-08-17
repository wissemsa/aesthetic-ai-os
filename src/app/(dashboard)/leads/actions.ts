"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { LeadSource, LeadStatus } from "@/types/crm";

export async function createLead(formData: FormData) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const status = ((formData.get("status") as LeadStatus) || "new") as LeadStatus;
  const source = ((formData.get("source") as LeadSource) || "website") as LeadSource;
  const servicesRaw = (formData.get("interested_services") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  const interestedServices = servicesRaw
    ? servicesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (!firstName || !lastName) {
    redirect("/leads/new?error=First name and Last name are required");
  }

  const leadId = crypto.randomUUID();

  const { error: leadError } = await supabase.from("leads").insert([
    {
      id: leadId,
      clinic_id: ctx.clinicId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      status,
      source,
      interested_services: interestedServices,
      notes,
      created_by: ctx.user.id,
    },
  ]);

  if (leadError) {
    redirect(`/leads/new?error=${encodeURIComponent(leadError.message)}`);
  }

  // Create initial activity log
  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      lead_id: leadId,
      type: "system",
      title: "Lead captured",
      content: `Lead created from source: ${source}`,
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  redirect(`/leads/${leadId}`);
}

export async function updateLead(leadId: string, formData: FormData) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const status = (formData.get("status") as LeadStatus) || "new";
  const source = (formData.get("source") as LeadSource) || "website";
  const servicesRaw = (formData.get("interested_services") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  const interestedServices = servicesRaw
    ? servicesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (!firstName || !lastName) {
    redirect(`/leads/${leadId}/edit?error=First name and Last name are required`);
  }

  const { error } = await supabase
    .from("leads")
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      status,
      source,
      interested_services: interestedServices,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("clinic_id", ctx.clinicId);

  if (error) {
    redirect(`/leads/${leadId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      lead_id: leadId,
      type: "system",
      title: "Lead updated",
      content: `Lead profile details updated. Status: ${status}`,
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  redirect(`/leads/${leadId}`);
}

export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("clinic_id", ctx.clinicId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      lead_id: leadId,
      type: "status_change",
      title: "Status updated",
      content: `Lead pipeline stage changed to ${newStatus.replace("_", " ")}.`,
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function toggleArchiveLead(leadId: string, archive: boolean) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({
      is_archived: archive,
      archived_at: archive ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("clinic_id", ctx.clinicId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      lead_id: leadId,
      type: "system",
      title: archive ? "Lead archived" : "Lead unarchived",
      content: archive
        ? "Lead was archived."
        : "Lead was restored from archive.",
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function convertLeadToPatient(leadId: string) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  // 1. Fetch current lead
  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("clinic_id", ctx.clinicId)
    .single();

  if (fetchError || !lead) {
    throw new Error("Lead not found or inaccessible.");
  }

  if (lead.converted_patient_id) {
    redirect(`/patients/${lead.converted_patient_id}`);
  }

  const patientId = crypto.randomUUID();

  // 2. Insert into patients
  const { error: patientError } = await supabase.from("patients").insert([
    {
      id: patientId,
      clinic_id: ctx.clinicId,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      notes: lead.notes
        ? `[Converted from Lead]\nSource: ${lead.source}\nInterested: ${lead.interested_services?.join(", ") || "None"}\n\n${lead.notes}`
        : `[Converted from Lead]\nSource: ${lead.source}\nInterested: ${lead.interested_services?.join(", ") || "None"}`,
      created_by: ctx.user.id,
    },
  ]);

  if (patientError) {
    throw new Error(`Failed to create patient: ${patientError.message}`);
  }

  // 3. Update lead status to converted
  const { error: updateLeadError } = await supabase
    .from("leads")
    .update({
      status: "converted",
      converted_patient_id: patientId,
      converted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("clinic_id", ctx.clinicId);

  if (updateLeadError) {
    throw new Error(`Failed to update lead: ${updateLeadError.message}`);
  }

  // 4. Activity entries for both lead and patient
  await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      lead_id: leadId,
      patient_id: patientId,
      type: "lead_converted",
      title: "Lead converted to patient",
      content: `Successfully converted lead ${lead.first_name} ${lead.last_name} into a permanent patient record.`,
      performed_by: ctx.user.id,
    },
  ]);

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/patients");
  revalidatePath("/dashboard");
  redirect(`/patients/${patientId}`);
}

export async function addLeadNote(leadId: string, formData: FormData) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const content = (formData.get("content") as string)?.trim();
  if (!content) return;

  const { error } = await supabase.from("activities").insert([
    {
      clinic_id: ctx.clinicId,
      lead_id: leadId,
      type: "note",
      title: "Lead / Inquiry Note",
      content,
      performed_by: ctx.user.id,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/leads/${leadId}`);
}
