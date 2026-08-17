"use client";

import { useTransition } from "react";
import { LeadStatus } from "@/types/crm";
import { updateLeadStatus } from "@/app/(dashboard)/leads/actions";

const statuses: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "consultation_scheduled", label: "Consultation" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

export function LeadStatusSelector({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (status: LeadStatus) => {
    if (status === currentStatus) return;
    startTransition(async () => {
      await updateLeadStatus(leadId, status);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
      {statuses.map((s) => {
        const isActive = currentStatus === s.value;
        return (
          <button
            key={s.value}
            type="button"
            disabled={isPending}
            onClick={() => handleChange(s.value)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              isActive
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
