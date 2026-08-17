import { AppointmentStatus } from "@/types/appointment";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const config: Record<
    AppointmentStatus,
    { label: string; bg: string; text: string; dot: string }
  > = {
    scheduled: {
      label: "Scheduled",
      bg: "bg-blue-500/10 border-blue-500/20",
      text: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    confirmed: {
      label: "Confirmed",
      bg: "bg-purple-500/10 border-purple-500/20",
      text: "text-purple-600 dark:text-purple-400",
      dot: "bg-purple-500",
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-rose-500/10 border-rose-500/20",
      text: "text-rose-600 dark:text-rose-400",
      dot: "bg-rose-500",
    },
    no_show: {
      label: "No Show",
      bg: "bg-zinc-500/10 border-zinc-500/20",
      text: "text-zinc-500 dark:text-zinc-400",
      dot: "bg-zinc-400",
    },
  };

  const current = config[status] || config.scheduled;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${current.bg} ${current.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}
