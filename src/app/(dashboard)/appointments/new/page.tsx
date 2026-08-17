import { createClient } from "@/lib/supabase/server";
import { getActiveClinicContext } from "@/lib/clinic";
import { Patient } from "@/types/crm";
import { createAppointment } from "../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";

const TREATMENT_PRESETS = [
  "Initial Aesthetic Consultation",
  "Botox / Neurotoxin Injection",
  "Dermal Fillers (Lips / Cheeks)",
  "Hydrafacial & Deep Cleanse",
  "Chemical Peel Rejuvenation",
  "Laser Skin Resurfacing",
  "Microneedling / RF Therapy",
  "Follow-up & Touch-up",
];

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string; error?: string }>;
}) {
  const { patient_id, error } = await searchParams;
  const ctx = await getActiveClinicContext();
  const supabase = await createClient();

  // Fetch active patients
  const { data: patientsData } = await supabase
    .from("patients")
    .select("id, first_name, last_name, email, phone")
    .eq("clinic_id", ctx.clinicId)
    .eq("is_archived", false)
    .order("last_name", { ascending: true });

  const patients = (patientsData as Patient[]) || [];

  // Default date to today formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={patient_id ? `/patients/${patient_id}` : "/appointments"}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Book Appointment
          </h1>
          <p className="text-xs text-zinc-500">
            Schedule a consultation or aesthetic procedure for your patient.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form action={createAppointment} className="space-y-6">
        {/* Patient Selection */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Patient
          </h2>
          <div className="mt-4 space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Select Patient <span className="text-red-500">*</span>
            </label>
            <select
              name="patient_id"
              defaultValue={patient_id || ""}
              required
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
            >
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} {p.phone ? `(${p.phone})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Treatment & Service Details */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Treatment Details
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Appointment Title / Procedure <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                required
                list="treatment-presets"
                placeholder="e.g. Botox / Neurotoxin Injection"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
              />
              <datalist id="treatment-presets">
                {TREATMENT_PRESETS.map((preset) => (
                  <option key={preset} value={preset} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Specific Service / Product
              </label>
              <input
                name="service_name"
                placeholder="e.g. Botox 30 units / Juvederm Ultra"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Booking Source
              </label>
              <select
                name="source"
                defaultValue="manual"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
              >
                <option value="manual">Clinic Staff (Manual)</option>
                <option value="phone">Phone Call</option>
                <option value="online">Online Booking</option>
                <option value="ai_receptionist">AI Receptionist (Phase 6)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time Schedule */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Schedule & Duration
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                defaultValue={todayStr}
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                defaultValue="10:00"
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Duration
              </label>
              <select
                name="duration_minutes"
                defaultValue="30"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes (1 hr)</option>
                <option value="90">90 Minutes (1.5 hrs)</option>
                <option value="120">120 Minutes (2 hrs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointment Notes */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Appointment Notes & Preparation
          </h2>
          <div className="mt-4 space-y-1.5">
            <textarea
              name="notes"
              rows={3}
              placeholder="Preparation instructions, clinical objectives, specific anesthesia requests..."
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-200"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href={patient_id ? `/patients/${patient_id}` : "/appointments"}>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Confirm Booking
          </Button>
        </div>
      </form>
    </div>
  );
}
