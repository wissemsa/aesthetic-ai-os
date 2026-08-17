"use client";

import { useTransition } from "react";
import { AppointmentStatus } from "@/types/appointment";
import { updateAppointmentStatus } from "@/app/(dashboard)/appointments/actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Check, XCircle, UserX } from "lucide-react";

export function StatusQuickActions({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: AppointmentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatus = (status: AppointmentStatus) => {
    if (status === "cancelled") {
      const reason = prompt("Please provide a cancellation reason (optional):");
      if (reason === null) return; // User cancelled prompt
      startTransition(async () => {
        await updateAppointmentStatus(appointmentId, "cancelled", reason);
      });
      return;
    }

    startTransition(async () => {
      await updateAppointmentStatus(appointmentId, status);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {currentStatus === "scheduled" && (
        <Button
          size="xs"
          variant="outline"
          disabled={isPending}
          onClick={() => handleStatus("confirmed")}
          className="gap-1 text-purple-600 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
        >
          <Check className="h-3 w-3" />
          Confirm
        </Button>
      )}

      {(currentStatus === "scheduled" || currentStatus === "confirmed") && (
        <>
          <Button
            size="xs"
            variant="outline"
            disabled={isPending}
            onClick={() => handleStatus("completed")}
            className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3" />
            Complete
          </Button>

          <Button
            size="xs"
            variant="outline"
            disabled={isPending}
            onClick={() => handleStatus("no_show")}
            className="gap-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400"
          >
            <UserX className="h-3 w-3" />
            No-Show
          </Button>

          <Button
            size="xs"
            variant="outline"
            disabled={isPending}
            onClick={() => handleStatus("cancelled")}
            className="gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
          >
            <XCircle className="h-3 w-3" />
            Cancel
          </Button>
        </>
      )}

      {currentStatus === "completed" && (
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </span>
      )}

      {currentStatus === "cancelled" && (
        <span className="text-xs font-medium text-rose-500 dark:text-rose-400 flex items-center gap-1">
          <XCircle className="h-3.5 w-3.5" /> Cancelled
        </span>
      )}

      {currentStatus === "no_show" && (
        <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
          <UserX className="h-3.5 w-3.5" /> No-Show
        </span>
      )}
    </div>
  );
}
