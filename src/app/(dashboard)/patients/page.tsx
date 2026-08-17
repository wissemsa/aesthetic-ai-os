import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { Patient } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { ArchiveBadge } from "@/components/crm/status-badge";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; show_archived?: string }>;
}) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();
  const { q, show_archived } = await searchParams;

  const showArchived = show_archived === "true";

  // Build query
  let query = supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", showArchived)
    .order("created_at", { ascending: false });

  if (q && q.trim() !== "") {
    const searchTerm = `%${q.trim()}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`
    );
  }

  const { data: patients } = await query;
  const patientList = (patients as Patient[]) || [];

  // Query counts for stats
  const { count: totalActive } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", false);

  const { count: totalArchived } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Patients
          </h1>
          <p className="text-sm text-zinc-500">
            Manage your aesthetic patient records, histories, and profiles.
          </p>
        </div>
        <Link href="/patients/new">
          <Button className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Active Patients</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {totalActive ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Clinic Workspace</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-lg font-semibold text-zinc-800 truncate dark:text-zinc-200">
            {ctx.clinic.name}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Archived Records</span>
            <span className="text-xs text-zinc-400">Vault</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {totalArchived ?? 0}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-200"
          />
          {showArchived && (
            <input type="hidden" name="show_archived" value="true" />
          )}
        </form>

        <div className="flex items-center gap-2">
          <Link
            href={`/patients${showArchived ? "" : "?show_archived=true"}`}
            className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
              showArchived
                ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            }`}
          >
            {showArchived ? "Showing Archived" : "View Archived"}
          </Link>
        </div>
      </div>

      {/* Patients Table / List */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {patientList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <Users className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              No patients found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-500">
              {q
                ? `No patients match the search term "${q}".`
                : showArchived
                ? "There are currently no archived patient records."
                : "Get started by adding your first patient profile to the clinic."}
            </p>
            {!showArchived && (
              <Link href="/patients/new" className="mt-4">
                <Button size="sm" className="gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Add First Patient
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Date of Birth</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {patientList.map((patient) => {
                  const initials = `${patient.first_name[0] || ""}${
                    patient.last_name[0] || ""
                  }`.toUpperCase();

                  return (
                    <tr
                      key={patient.id}
                      className="group transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="flex items-center gap-3 font-medium text-zinc-900 hover:text-black dark:text-zinc-100 dark:hover:text-white"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {patient.first_name} {patient.last_name}
                            </div>
                            <div className="text-xs text-zinc-400">
                              Added {new Date(patient.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-300">
                        <div className="space-y-1">
                          {patient.email ? (
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <Mail className="h-3 w-3" />
                              <span>{patient.email}</span>
                            </div>
                          ) : null}
                          {patient.phone ? (
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <Phone className="h-3 w-3" />
                              <span>{patient.phone}</span>
                            </div>
                          ) : null}
                          {!patient.email && !patient.phone && (
                            <span className="text-zinc-400">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-300">
                        {patient.date_of_birth ? (
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {patient.is_archived ? (
                          <ArchiveBadge />
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
