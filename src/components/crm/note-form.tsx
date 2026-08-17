"use client";

import { useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export function NoteForm({
  action,
  placeholder = "Write a consultation or follow-up note...",
}: {
  action: (formData: FormData) => Promise<void>;
  placeholder?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = (formData.get("content") as string)?.trim();
    if (!content) return;

    startTransition(async () => {
      await action(formData);
      formRef.current?.reset();
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <textarea
        name="content"
        rows={3}
        required
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="gap-1.5"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          {isPending ? "Adding note..." : "Add Note"}
        </Button>
      </div>
    </form>
  );
}
