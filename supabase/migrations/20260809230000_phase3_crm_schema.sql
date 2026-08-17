-- Phase 3: CRM Schema (Patients, Leads, Activities)

-- Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'consultation_scheduled', 'qualified', 'converted', 'lost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.lead_source AS ENUM ('website', 'instagram', 'facebook', 'referral', 'walk_in', 'google_ads', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.activity_type AS ENUM ('note', 'status_change', 'lead_converted', 'contact', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.gender_type AS ENUM ('female', 'male', 'other', 'prefer_not_to_say');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender public.gender_type,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    notes TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status public.lead_status NOT NULL DEFAULT 'new'::public.lead_status,
    source public.lead_source NOT NULL DEFAULT 'website'::public.lead_source,
    interested_services TEXT[] DEFAULT '{}'::TEXT[],
    notes TEXT,
    converted_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Activities / Timeline Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    type public.activity_type NOT NULL DEFAULT 'note'::public.activity_type,
    title TEXT NOT NULL,
    content TEXT,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT activity_target_check CHECK (patient_id IS NOT NULL OR lead_id IS NOT NULL)
);

-- Indexes for optimal multi-tenant query performance
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_archived ON public.patients(clinic_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(clinic_id, last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_leads_clinic_id ON public.leads(clinic_id);
CREATE INDEX IF NOT EXISTS idx_leads_clinic_status ON public.leads(clinic_id, status, is_archived);
CREATE INDEX IF NOT EXISTS idx_leads_clinic_archived ON public.leads(clinic_id, is_archived);

CREATE INDEX IF NOT EXISTS idx_activities_patient ON public.activities(clinic_id, patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON public.activities(clinic_id, lead_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER set_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS Policies for Patients
CREATE POLICY "Users can view clinic patients"
    ON public.patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = patients.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert clinic patients"
    ON public.patients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = patients.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update clinic patients"
    ON public.patients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = patients.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete clinic patients"
    ON public.patients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = patients.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

-- RLS Policies for Leads
CREATE POLICY "Users can view clinic leads"
    ON public.leads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = leads.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert clinic leads"
    ON public.leads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = leads.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update clinic leads"
    ON public.leads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = leads.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete clinic leads"
    ON public.leads FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = leads.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

-- RLS Policies for Activities
CREATE POLICY "Users can view clinic activities"
    ON public.activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = activities.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert clinic activities"
    ON public.activities FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = activities.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update clinic activities"
    ON public.activities FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = activities.clinic_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete clinic activities"
    ON public.activities FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm
            WHERE cm.clinic_id = activities.clinic_id
            AND cm.user_id = auth.uid()
        )
    );
