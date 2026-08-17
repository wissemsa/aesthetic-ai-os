import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { Lead, Activity } from "@/types/crm";
import { toggleArchiveLead, addLeadNote } from "../actions";
import {
  LeadStatusBadge,
  LeadSourceBadge,
  ArchiveBadge,
} from "@/components/crm/status-badge";
import { LeadStatusSelector } from "@/components/crm/lead-status-selector";
import { ConvertLeadButton } from "@/components/crm/lead-convert-button";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { NoteForm } from "@/components/crm/note-form";
import { ArchiveButton } from "@/components/crm/archive-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Sparkles,
  FileEdit,
  Clock,
  Calendar,
} from "lucide-react";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  // Fetch lead scoped to active clinic
  const { data: leadData, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("clinic_id", ctx.clinicId)
    .single();

  if (leadError || !leadData) {
    notFound();
  }

  const lead = leadData as Lead;

  // Fetch timeline / activities
  const { data: activitiesData } = await supabase
    .from("activities")
    .select("*, profiles(full_name, avatar_url)")
    .eq("lead_id", id)
    .eq("clinic_id", ctx.clinicId)
    .order("created_at", { ascending: false });

  const activities = (activitiesData as Activity[]) || [];

  const initials = `${lead.first_name[0] || ""}${
    lead.last_name[0] || ""
  }`.toUpperCase();

  // Bind server actions
  const handleArchiveToggle = toggleArchiveLead.bind(null, lead.id);
  const handleAddNote = addLeadNote.bind(null, lead.id);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {lead.first_name} {lead.last_name}
              </h1>
              {lead.is_archived ? (
                <ArchiveBadge />
              ) : (
                <LeadStatusBadge status={lead.status} />
              )}
              <LeadSourceBadge source={lead.source} />
            </div>
            <p className="text-xs text-zinc-400">
              Captured on{" "}
              {new Date(lead.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ConvertLeadButton
            leadId={lead.id}
            isConverted={lead.status === "converted" || !!lead.converted_patient_id}
            convertedPatientId={lead.converted_patient_id}
          />
          <ArchiveButton
            isArchived={lead.is_archived}
            onToggle={handleArchiveToggle}
            entityName="lead"
          />
          <Link href={`/leads/${lead.id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <FileEdit className="h-3.5 w-3.5" />
              Edit Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Stage Progression Bar */}
      {!lead.is_archived && lead.status !== "converted" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Pipeline Stage
            </span>
            <span className="text-xs text-zinc-400">
              Click stage to transition lead
            </span>
          </div>
          <LeadStatusSelector
            leadId={lead.id}
            currentStatus={lead.status}
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Prospect Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Prospect Overview Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-lg font-bold text-white ring-4 ring-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-800">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-zinc-900 truncate dark:text-zinc-50">
                  {lead.first_name} {lead.last_name}
                </h2>
                <div className="mt-1 flex items-center gap-1.5">
                  <LeadSourceBadge source={lead.source} />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3.5 border-t border-zinc-100 pt-5 text-xs dark:border-zinc-800">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  Email
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[160px]">
                  {lead.email || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-500">
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-zinc-400" />
                  Phone
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {lead.phone || "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-500">
                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  Created
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Interested Treatments Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Interested Services
              </h3>
            </div>
            <div className="mt-3">
              {lead.interested_services && lead.interested_services.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {lead.interested_services.map((svc, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-zinc-400">
                  No specific treatments tagged.
                </p>
              )}
            </div>
          </div>

          {/* Inquiry Notes */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Inquiry Notes
            </h3>
            <div className="mt-3">
              {lead.notes ? (
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {lead.notes}
                </p>
              ) : (
                <p className="text-xs italic text-zinc-400">
                  No initial notes recorded.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Add Note Section */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Add Lead Follow-Up Note
              </h3>
              <Clock className="h-4 w-4 text-zinc-400" />
            </div>
            <NoteForm
              action={handleAddNote}
              placeholder="Record call summary, consultation scheduling, or next steps..."
            />
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Inquiry Timeline & Communication History
            </h3>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
