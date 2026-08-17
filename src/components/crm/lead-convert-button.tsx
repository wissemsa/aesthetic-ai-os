"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { convertLeadToPatient } from "@/app/(dashboard)/leads/actions";

export function ConvertLeadButton({
  leadId,
  isConverted,
  convertedPatientId,
}: {
  leadId: string;
  isConverted: boolean;
  convertedPatientId?: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  if (isConverted && convertedPatientId) {
    return (
      <a href={`/patients/${convertedPatientId}`}>
        <Button variant="outline" size="sm" className="gap-1.5 text-teal-600 border-teal-200 hover:bg-teal-50 dark:text-teal-400 dark:border-teal-800">
          <UserCheck className="h-3.5 w-3.5" />
          View Converted Patient Profile
        </Button>
      </a>
    );
  }

  const handleConvert = () => {
    if (!confirm("Are you sure you want to convert this lead into a permanent patient record?")) {
      return;
    }
    startTransition(async () => {
      await convertLeadToPatient(leadId);
    });
  };

  return (
    <Button
      onClick={handleConvert}
      disabled={isPending}
      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
      size="sm"
    >
      <UserCheck className="h-3.5 w-3.5" />
      {isPending ? "Converting..." : "Convert to Patient"}
    </Button>
  );
}
