-- Drop Phase 1 tables if they exist to start clean for Phase 2 terminology
DROP TABLE IF EXISTS public.tenant_members CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TYPE IF EXISTS public.tenant_role CASCADE;

-- Create custom types
CREATE TYPE public.clinic_role AS ENUM ('owner', 'admin', 'staff', 'viewer');

-- Create clinics table
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create clinic_members table
CREATE TABLE public.clinic_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.clinic_role NOT NULL DEFAULT 'staff'::public.clinic_role,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(clinic_id, user_id)
);

-- Setup Row Level Security (RLS)

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Clinics: Users can view clinics they are a member of
CREATE POLICY "Users can view clinics they belong to" 
    ON public.clinics FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members 
            WHERE clinic_members.clinic_id = clinics.id 
            AND clinic_members.user_id = auth.uid()
        )
    );

-- Clinics: Any authenticated user can create a clinic
CREATE POLICY "Users can create clinics" 
    ON public.clinics FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Profiles: Users can view profiles of people in the same clinic
CREATE POLICY "Users can view profiles of clinic members" 
    ON public.profiles FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members tm1
            JOIN public.clinic_members tm2 ON tm1.clinic_id = tm2.clinic_id
            WHERE tm1.user_id = auth.uid() AND tm2.user_id = profiles.id
        )
    );

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Clinic Members: Users can view members of their clinics
CREATE POLICY "Users can view members of their clinics" 
    ON public.clinic_members FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members cm 
            WHERE cm.clinic_id = clinic_members.clinic_id 
            AND cm.user_id = auth.uid()
        )
    );

-- Clinic Members: Users can add themselves as members
CREATE POLICY "Users can add themselves to a clinic" 
    ON public.clinic_members FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Functions & Triggers

-- Trigger to create a user profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_clinics_updated_at
    BEFORE UPDATE ON public.clinics
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_clinic_members_updated_at
    BEFORE UPDATE ON public.clinic_members
    FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
