import { Activity } from "@/types/crm";
import { MessageSquare, RefreshCw, UserCheck, PhoneCall, Info } from "lucide-react";

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
        No notes or activity logged yet.
      </div>
    );
  }

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "note":
        return <MessageSquare className="h-3.5 w-3.5 text-blue-500" />;
      case "status_change":
        return <RefreshCw className="h-3.5 w-3.5 text-purple-500" />;
      case "lead_converted":
        return <UserCheck className="h-3.5 w-3.5 text-emerald-500" />;
      case "contact":
        return <PhoneCall className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <Info className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative space-y-4 before:absolute before:bottom-0 before:left-3 before:top-2 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
      {activities.map((act) => (
        <div key={act.id} className="relative flex items-start gap-4 pl-8">
          <div className="absolute left-1.5 top-1 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-zinc-900 dark:ring-zinc-950">
            {getIcon(act.type)}
          </div>
          <div className="flex-1 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition-all hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {act.title}
              </span>
              <span className="text-[11px] text-zinc-400">
                {formatDate(act.created_at)}
              </span>
            </div>
            {act.content && (
              <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {act.content}
              </p>
            )}
            {act.profiles?.full_name && (
              <div className="mt-2 text-[10px] text-zinc-400">
                By {act.profiles.full_name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
