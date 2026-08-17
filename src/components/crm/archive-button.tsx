"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore } from "lucide-react";

export function ArchiveButton({
  isArchived,
  onToggle,
  entityName = "record",
}: {
  isArchived: boolean;
  onToggle: (archive: boolean) => Promise<void>;
  entityName?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const actionText = isArchived ? "restore" : "archive";
    if (!confirm(`Are you sure you want to ${actionText} this ${entityName}?`)) {
      return;
    }
    startTransition(async () => {
      await onToggle(!isArchived);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
      className={`gap-1.5 ${
        isArchived
          ? "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
      }`}
    >
      {isArchived ? (
        <>
          <ArchiveRestore className="h-3.5 w-3.5" />
          {isPending ? "Restoring..." : "Restore"}
        </>
      ) : (
        <>
          <Archive className="h-3.5 w-3.5" />
          {isPending ? "Archiving..." : "Archive"}
        </>
      )}
    </Button>
  );
}
