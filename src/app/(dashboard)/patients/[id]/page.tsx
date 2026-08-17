import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { Patient, Activity } from "@/types/crm";
import { toggleArchivePatient, addPatientNote } from "../actions";
import { ArchiveBadge } from "@/components/crm/status-badge";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { NoteForm } from "@/components/crm/note-form";
import { ArchiveButton } from "@/components/crm/archive-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileEdit,
  Clock,
  CalendarPlus,
} from "lucide-react";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  // Fetch patient scoped to active clinic
  const { data: patientData, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", ctx.clinicId)
    .single();

  if (patientError || !patientData) {
    notFound();
  }

  const patient = patientData as Patient;

  // Fetch timeline / activities
  const { data: activitiesData } = await supabase
    .from("activities")
    .select("*, profiles(full_name, avatar_url)")
    .eq("patient_id", id)
    .eq("clinic_id", ctx.clinicId)
    .order("created_at", { ascending: false });

  const activities = (activitiesData as Activity[]) || [];

  const initials = `${patient.first_name[0] || ""}${
    patient.last_name[0] || ""
  }`.toUpperCase();

  // Bind server action for archive toggle
  const handleArchiveToggle = toggleArchivePatient.bind(null, patient.id);
  const handleAddNote = addPatientNote.bind(null, patient.id);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/patients"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {patient.first_name} {patient.last_name}
              </h1>
              {patient.is_archived ? (
                <ArchiveBadge />
              ) : (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Patient since{" "}
              {new Date(patient.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArchiveButton
            isArchived={patient.is_archived}
            onToggle={handleArchiveToggle}
            entityName="patient"
          />
          <Link href={`/patients/${patient.id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <FileEdit className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Demographics & Notes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Patient Overview Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-lg font-bold text-white ring-4 ring-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-800">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-zinc-900 truncate dark:text-zinc-50">
                  {patient.first_name} {patient.last_name}
                </h2>
                <span className="text-xs text-zinc-400 capitalize">
                  {patient.gender ? patient.gender.replace("_", " ") : "Patient"}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3.5 border-t border-zinc-100 pt-5 text-xs dark:border-zinc-800">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  Email
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[160px]">
                  {patient.email || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-500">
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-zinc-400" />
                  Phone
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {patient.phone || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-500">
                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  DOB
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {patient.date_of_birth
                    ? new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              <div className="flex items-start justify-between text-zinc-500">
                <span className="flex items-center gap-2 pt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  Address
                </span>
                <span className="font-medium text-zinc-900 text-right dark:text-zinc-100 max-w-[160px]">
                  {patient.address_line1 ? (
                    <>
                      {patient.address_line1}
                      {patient.address_line2 && `, ${patient.address_line2}`}
                      {(patient.city || patient.state) && (
                        <br />
                      )}
                      {[patient.city, patient.state, patient.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Clinical Profile & Background */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Clinical Background & Goals
            </h3>
            <div className="mt-3">
              {patient.notes ? (
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {patient.notes}
                </p>
              ) : (
                <p className="text-xs italic text-zinc-400">
                  No medical background or aesthetic notes recorded.
                </p>
              )}
            </div>
          </div>

          {/* Appointments Foundation (Prepared for Phase 4) */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Appointments & Treatments
              </h3>
              <CalendarPlus className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-zinc-200 p-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
              No appointments scheduled yet. Booking & clinical schedule module activates in Phase 4.
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Add Note Section */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Add Clinical / Consultation Note
              </h3>
              <Clock className="h-4 w-4 text-zinc-400" />
            </div>
            <NoteForm
              action={handleAddNote}
              placeholder="Record treatment outcomes, patient requests, or consultation findings..."
            />
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Patient Activity & Consultation History
            </h3>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
