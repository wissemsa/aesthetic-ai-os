-- Phase 4: Scheduling & Appointments Schema

-- Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.appointment_source AS ENUM ('manual', 'online', 'ai_receptionist', 'phone');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    service_name TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status public.appointment_status NOT NULL DEFAULT 'scheduled'::public.appointment_status,
    source public.appointment_source NOT NULL DEFAULT 'manual'::public.appointment_source,
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_valid_time_range CHECK (end_time > start_time)
);

-- Indexes for fast multi-tenant querying & calendar lookups
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_start ON public.appointments(clinic_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_patient ON public.appointments(clinic_id, patient_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_status ON public.appointments(clinic_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_provider ON public.appointments(clinic_id, provider_id);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Updated at Trigger
CREATE TRIGGER set_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS Policies for Appointments
CREATE POLICY "Users can view clinic appointments"
    ON public.appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = appointments.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert clinic appointments"
    ON public.appointments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = appointments.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update clinic appointments"
    ON public.appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = appointments.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete clinic appointments"
    ON public.appointments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = appointments.clinic_id
            AND cm.user_id = auth.uid()
        )
    );
