export type LeadStatus =
  | "new"
  | "contacted"
  | "consultation_scheduled"
  | "qualified"
  | "converted"
  | "lost";

export type LeadSource =
  | "website"
  | "instagram"
  | "facebook"
  | "referral"
  | "walk_in"
  | "google_ads"
  | "other";

export type ActivityType =
  | "note"
  | "status_change"
  | "lead_converted"
  | "contact"
  | "system"
  | "communication";

export type GenderType = "female" | "male" | "other" | "prefer_not_to_say";

export interface Patient {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: GenderType | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  source: LeadSource;
  interested_services: string[];
  notes: string | null;
  converted_patient_id: string | null;
  converted_at: string | null;
  is_archived: boolean;
  archived_at: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  lead_id: string | null;
  type: ActivityType;
  title: string;
  content: string | null;
  performed_by: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}
