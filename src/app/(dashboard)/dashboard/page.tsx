import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { Patient, Lead } from "@/types/crm";
import { AppointmentWithDetails } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "@/components/crm/status-badge";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { StatusQuickActions } from "@/components/appointments/status-quick-actions";
import Link from "next/link";
import {
  Users,
  Target,
  UserPlus,
  Calendar,
  CalendarPlus,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  // 1. Fetch counts
  const { count: patientCount } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", false);

  const { count: activeLeadCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", false);

  const { count: todayAppointmentCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .gte("start_time", startOfToday)
    .lte("start_time", endOfToday)
    .neq("status", "cancelled");

  const { count: upcomingAppointmentCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .gte("start_time", now.toISOString())
    .neq("status", "cancelled");

  // 2. Fetch Today's Appointments Agenda
  const { data: todayAppointmentsData } = await supabase
    .from("appointments")
    .select("*, patients(id, first_name, last_name, email, phone)")
    .eq("clinic_id", ctx.clinicId)
    .gte("start_time", startOfToday)
    .lte("start_time", endOfToday)
    .order("start_time", { ascending: true });

  const todayAppointments = (todayAppointmentsData as AppointmentWithDetails[]) || [];

  // 3. Fetch recent patients
  const { data: recentPatientsData } = await supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(4);

  const recentPatients = (recentPatientsData as Patient[]) || [];

  // 4. Fetch recent leads
  const { data: recentLeadsData } = await supabase
    .from("leads")
    .select("*")
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(4);

  const recentLeads = (recentLeadsData as Lead[]) || [];

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Overview
          </h1>
          <p className="text-sm text-zinc-500">
            Welcome to <span className="font-semibold text-zinc-700 dark:text-zinc-300">{ctx.clinic.name}</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/appointments/new">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <CalendarPlus className="h-3.5 w-3.5" />
              Book Appointment
            </Button>
          </Link>
          <Link href="/leads/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Capture Lead
            </Button>
          </Link>
          <Link href="/patients/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              Add Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* CRM & Schedule Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Link
          href="/appointments"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Today&apos;s Bookings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {todayAppointmentCount ?? 0}
          </p>
          <span className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            View day schedule <ChevronRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          href="/appointments"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Upcoming Total</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
            {upcomingAppointmentCount ?? 0}
          </p>
          <span className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            Open calendar <ChevronRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          href="/patients"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Active Patients</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {patientCount ?? 0}
          </p>
          <span className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            Directory <ChevronRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          href="/leads"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Pipeline Leads</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {activeLeadCount ?? 0}
          </p>
          <span className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            Inquiry pipeline <ChevronRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      {/* Today's Appointments Agenda Section */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Today&apos;s Appointments Agenda
            </h2>
          </div>
          <Link
            href="/appointments"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Full Calendar View
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:justify-between transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 rounded-xl px-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/appointments/${apt.id}`}
                        className="text-xs font-bold text-zinc-900 hover:underline dark:text-zinc-100"
                      >
                        {apt.title}
                      </Link>
                      <AppointmentStatusBadge status={apt.status} />
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {formatTime(apt.start_time)} – {formatTime(apt.end_time)} •{" "}
                      {apt.patients ? (
                        <Link
                          href={`/patients/${apt.patients.id}`}
                          className="font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                        >
                          {apt.patients.first_name} {apt.patients.last_name}
                        </Link>
                      ) : (
                        "No patient"
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <StatusQuickActions
                    appointmentId={apt.id}
                    currentStatus={apt.status}
                  />
                  <Link href={`/appointments/${apt.id}`}>
                    <Button size="xs" variant="ghost">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Patients & Recent Leads */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Patients */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Recent Patients
            </h2>
            <Link
              href="/patients"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              View all
            </Link>
          </div>

          {recentPatients.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No patients added yet.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentPatients.map((patient) => {
                const initials = `${patient.first_name[0] || ""}${
                  patient.last_name[0] || ""
                }`.toUpperCase();

                return (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="flex items-center justify-between py-3 transition hover:opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {patient.phone || patient.email || "No contact"}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Recent Leads & Inquiries
            </h2>
            <Link
              href="/leads"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              View all
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No inquiries or leads captured yet.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between py-3 transition hover:opacity-80"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                      {lead.first_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {lead.phone || lead.email || "No contact"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LeadStatusBadge status={lead.status} />
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
