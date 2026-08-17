import { Patient } from "./crm";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentSource =
  | "manual"
  | "online"
  | "ai_receptionist"
  | "phone";

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  provider_id: string | null;
  title: string;
  service_name: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  reminder_sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  patients: Pick<Patient, "id" | "first_name" | "last_name" | "email" | "phone"> | null;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}
