import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { AppointmentWithDetails } from "@/types/appointment";
import { CalendarView } from "@/components/appointments/calendar-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  CalendarPlus,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default async function AppointmentsPage() {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  // Fetch all clinic appointments with patient & provider details
  const { data: appointmentsData } = await supabase
    .from("appointments")
    .select("*, patients(id, first_name, last_name, email, phone), profiles(id, full_name, avatar_url)")
    .eq("clinic_id", ctx.clinicId)
    .order("start_time", { ascending: true });

  const appointments = (appointmentsData as AppointmentWithDetails[]) || [];

  // Compute metrics
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  const todayCount = appointments.filter(
    (apt) => apt.start_time >= startOfToday && apt.start_time <= endOfToday && apt.status !== "cancelled"
  ).length;

  const upcomingCount = appointments.filter(
    (apt) => apt.start_time > now.toISOString() && apt.status !== "cancelled"
  ).length;

  const confirmedCount = appointments.filter((apt) => apt.status === "confirmed").length;
  const completedCount = appointments.filter((apt) => apt.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Appointments & Schedule
          </h1>
          <p className="text-sm text-zinc-500">
            Manage your clinic calendar, consultation bookings, and aesthetic treatments.
          </p>
        </div>
        <Link href="/appointments/new">
          <Button className="gap-2 shadow-sm">
            <CalendarPlus className="h-4 w-4" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Schedule Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Today&apos;s Bookings</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {todayCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Upcoming Total</span>
            <CalendarIcon className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
            {upcomingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Confirmed</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {confirmedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Completed Total</span>
            <CheckCircle2 className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Calendar View Component */}
      <CalendarView appointments={appointments} />
    </div>
  );
}
