import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { Lead, LeadStatus } from "@/types/crm";
import { Button } from "@/components/ui/button";
import {
  LeadStatusBadge,
  LeadSourceBadge,
  ArchiveBadge,
} from "@/components/crm/status-badge";
import Link from "next/link";
import {
  Target,
  UserPlus,
  Search,
  Mail,
  Phone,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    show_archived?: string;
  }>;
}) {
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();
  const { q, status, show_archived } = await searchParams;

  const showArchived = show_archived === "true";

  // Build query
  let query = supabase
    .from("leads")
    .select("*")
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", showArchived)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (q && q.trim() !== "") {
    const searchTerm = `%${q.trim()}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`
    );
  }

  const { data: leads } = await query;
  const leadList = (leads as Lead[]) || [];

  // Query stats
  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", false);

  const { count: newLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .eq("status", "new")
    .eq("is_archived", false);

  const { count: convertedLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", ctx.clinicId)
    .eq("status", "converted")
    .eq("is_archived", false);

  const statusFilters: { value: string; label: string }[] = [
    { value: "all", label: "All Leads" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "consultation_scheduled", label: "Consultation" },
    { value: "qualified", label: "Qualified" },
    { value: "converted", label: "Converted" },
    { value: "lost", label: "Lost" },
  ];

  const currentStatus = status || "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Leads & Inquiries
          </h1>
          <p className="text-sm text-zinc-500">
            Capture, nurture, and convert aesthetic prospects into loyal patients.
          </p>
        </div>
        <Link href="/leads/new">
          <Button className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" />
            Capture Lead
          </Button>
        </Link>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Active Pipeline</span>
            <Target className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {totalLeads ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">New Inquiries</span>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            {newLeads ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Converted Patients</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {convertedLeads ?? 0}
          </p>
        </div>
      </div>

      {/* Filters & Status Pills */}
      <div className="flex flex-col gap-4">
        {/* Status Stage Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {statusFilters.map((s) => {
            const isActive = currentStatus === s.value;
            const params = new URLSearchParams();
            if (s.value !== "all") params.set("status", s.value);
            if (q) params.set("q", q);
            if (showArchived) params.set("show_archived", "true");

            const href = `/leads${params.toString() ? `?${params.toString()}` : ""}`;

            return (
              <Link
                key={s.value}
                href={href}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* Search & Vault Toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              name="q"
              defaultValue={q || ""}
              placeholder="Search leads by name, email, or phone..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-200"
            />
            {status && status !== "all" && (
              <input type="hidden" name="status" value={status} />
            )}
            {showArchived && (
              <input type="hidden" name="show_archived" value="true" />
            )}
          </form>

          <div className="flex items-center gap-2">
            <Link
              href={`/leads?${new URLSearchParams({
                ...(status && status !== "all" ? { status } : {}),
                ...(q ? { q } : {}),
                ...(showArchived ? {} : { show_archived: "true" }),
              }).toString()}`}
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
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {leadList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <Target className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              No leads found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-500">
              {q
                ? `No leads match the search term "${q}".`
                : status && status !== "all"
                ? `No leads currently in the "${status.replace("_", " ")}" stage.`
                : showArchived
                ? "There are no archived leads in the vault."
                : "Capture your first inquiry or marketing lead."}
            </p>
            {!showArchived && (
              <Link href="/leads/new" className="mt-4">
                <Button size="sm" className="gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Capture New Lead
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3.5">Lead Name</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Services Interested</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {leadList.map((lead) => {
                  const initials = `${lead.first_name[0] || ""}${
                    lead.last_name[0] || ""
                  }`.toUpperCase();

                  return (
                    <tr
                      key={lead.id}
                      className="group transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="flex items-center gap-3 font-medium text-zinc-900 hover:text-black dark:text-zinc-100 dark:hover:text-white"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {lead.first_name} {lead.last_name}
                            </div>
                            <div className="text-xs text-zinc-400">
                              Captured {new Date(lead.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        {lead.is_archived ? (
                          <ArchiveBadge />
                        ) : (
                          <LeadStatusBadge status={lead.status} />
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <LeadSourceBadge source={lead.source} />
                      </td>

                      <td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-300">
                        <div className="space-y-1">
                          {lead.email ? (
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <Mail className="h-3 w-3" />
                              <span>{lead.email}</span>
                            </div>
                          ) : null}
                          {lead.phone ? (
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <Phone className="h-3 w-3" />
                              <span>{lead.phone}</span>
                            </div>
                          ) : null}
                          {!lead.email && !lead.phone && (
                            <span className="text-zinc-400">No contact info</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {lead.interested_services && lead.interested_services.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {lead.interested_services.map((svc, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                {svc}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/leads/${lead.id}`}
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
