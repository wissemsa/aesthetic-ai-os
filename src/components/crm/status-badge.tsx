import { LeadSource, LeadStatus } from "@/types/crm";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config: Record<
    LeadStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    new: {
      label: "New",
      bg: "bg-blue-500/10 border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    contacted: {
      label: "Contacted",
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    consultation_scheduled: {
      label: "Consultation Scheduled",
      bg: "bg-purple-500/10 border-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      dot: "bg-purple-500",
    },
    qualified: {
      label: "Qualified",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    converted: {
      label: "Converted",
      bg: "bg-teal-500/10 border-teal-500/20",
      text: "text-teal-600 dark:text-teal-400",
      dot: "bg-teal-500",
    },
    lost: {
      label: "Lost",
      bg: "bg-zinc-500/10 border-zinc-500/20",
      text: "text-zinc-500 dark:text-zinc-400",
      dot: "bg-zinc-400",
    },
  };

  const current = config[status] || config.new;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${current.bg} ${current.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}

export function LeadSourceBadge({ source }: { source: LeadSource }) {
  const labels: Record<LeadSource, string> = {
    website: "Website",
    instagram: "Instagram",
    facebook: "Facebook",
    referral: "Referral",
    walk_in: "Walk-In",
    google_ads: "Google Ads",
    other: "Other",
  };

  return (
    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {labels[source] || source}
    </span>
  );
}

export function ArchiveBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
      Archived
    </span>
  );
}
