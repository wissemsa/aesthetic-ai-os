import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { AppointmentWithDetails } from "@/types/appointment";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { StatusQuickActions } from "@/components/appointments/status-quick-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileEdit,
  Sparkles,
  AlertCircle,
  Bell,
} from "lucide-react";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const { data: appointmentData, error } = await supabase
    .from("appointments")
    .select("*, patients(id, first_name, last_name, email, phone), profiles(id, full_name, avatar_url)")
    .eq("id", id)
    .eq("clinic_id", ctx.clinicId)
    .single();

  if (error || !appointmentData) {
    notFound();
  }

  const apt = appointmentData as AppointmentWithDetails;

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const patientInitials = apt.patients
    ? `${apt.patients.first_name[0] || ""}${apt.patients.last_name[0] || ""}`.toUpperCase()
    : "P";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/appointments"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {apt.title}
              </h1>
              <AppointmentStatusBadge status={apt.status} />
            </div>
            <p className="text-xs text-zinc-400">
              Booking Ref: {apt.id.slice(0, 8).toUpperCase()} • Source: {apt.source}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusQuickActions
            appointmentId={apt.id}
            currentStatus={apt.status}
          />
          <Link href={`/appointments/${apt.id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <FileEdit className="h-3.5 w-3.5" />
              Edit Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Schedule & Patient Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Schedule Info Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Schedule & Time
            </h3>
            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatDate(apt.start_time)}
                  </div>
                  <div className="text-zinc-500">Scheduled Date</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatTime(apt.start_time)} – {formatTime(apt.end_time)}
                  </div>
                  <div className="text-zinc-500">
                    Duration: {apt.duration_minutes} Minutes
                  </div>
                </div>
              </div>

              {apt.service_name && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {apt.service_name}
                    </div>
                    <div className="text-zinc-500">Product / Procedure</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Patient Card */}
          {apt.patients && (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Patient Details
                </h3>
                <Link
                  href={`/patients/${apt.patients.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  View Profile
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {patientInitials}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/patients/${apt.patients.id}`}
                    className="font-bold text-zinc-900 hover:underline truncate dark:text-zinc-100 block"
                  >
                    {apt.patients.first_name} {apt.patients.last_name}
                  </Link>
                  <span className="text-xs text-zinc-400">Patient Record</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs border-t border-zinc-100 pt-3 dark:border-zinc-800">
                {apt.patients.phone && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{apt.patients.phone}</span>
                  </div>
                )}
                {apt.patients.email && (
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{apt.patients.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clinical Notes & Automated Reminders */}
        <div className="space-y-6 lg:col-span-2">
          {/* Cancellation Alert (if cancelled) */}
          {apt.status === "cancelled" && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900/50 dark:bg-rose-950/40">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                    Appointment Cancelled
                  </h3>
                  <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                    {apt.cancellation_reason || "No cancellation reason recorded."}
                  </p>
                  {apt.cancelled_at && (
                    <span className="mt-2 block text-[11px] text-rose-500">
                      Cancelled on {new Date(apt.cancelled_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Appointment Clinical Notes */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Appointment Notes & Clinical Directives
            </h3>
            <div className="mt-3">
              {apt.notes ? (
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {apt.notes}
                </p>
              ) : (
                <p className="text-xs italic text-zinc-400">
                  No notes recorded for this appointment.
                </p>
              )}
            </div>
          </div>

          {/* Communication & Automated Reminders (Phase 5 Foundation) */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Patient Reminders & Confirmations
                </h3>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">
                Phase 5 Module
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Automated SMS/Email reminders and 2-way patient confirmation will activate in Phase 5 Communications.
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-zinc-200 p-4 text-xs text-zinc-400 dark:border-zinc-800 text-center">
              Status: {apt.reminder_sent_at ? `Reminder dispatched on ${new Date(apt.reminder_sent_at).toLocaleDateString()}` : "Ready for automated dispatch"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
