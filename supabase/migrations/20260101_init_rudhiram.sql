-- ==============================================================================
-- RUDHIRAM – A Centralised Blood Donor Portal
-- National Service Scheme (NSS Units 20 & 49), Christ College (Autonomous), Irinjalakuda
-- University of Calicut
-- PostgreSQL / Supabase Schema & Row-Level Security (RLS) Migrations
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DONORS TABLE
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
    gender VARCHAR(50) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    locality VARCHAR(255) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    last_donation_date DATE,
    availability VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (availability IN ('Available', 'Busy', 'Inactive')),
    additional_information TEXT,
    consent BOOLEAN NOT NULL DEFAULT FALSE CHECK (consent = TRUE),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast administrative querying & matching
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON public.donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_district ON public.donors(district);
CREATE INDEX IF NOT EXISTS idx_donors_availability ON public.donors(availability);
CREATE INDEX IF NOT EXISTS idx_donors_mobile ON public.donors(mobile);
CREATE INDEX IF NOT EXISTS idx_donors_created_at ON public.donors(created_at DESC);

-- 3. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_required INTEGER NOT NULL DEFAULT 1 CHECK (units_required >= 1 AND units_required <= 50),
    hospital_name VARCHAR(255) NOT NULL,
    hospital_location VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    required_date DATE NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (urgency IN ('Normal', 'Urgent', 'Emergency')),
    additional_information TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Donor Identified', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast administrative querying
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON public.blood_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_district ON public.blood_requests(district);
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at ON public.blood_requests(created_at DESC);

-- 4. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID,
    admin_name VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('donor', 'blood_request', 'auth', 'export', 'system')),
    record_id VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);

-- 5. ADMINISTRATORS PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'coordinator' CHECK (role IN ('superadmin', 'coordinator', 'volunteer')),
    nss_unit VARCHAR(50) DEFAULT 'NSS Units 20 & 49',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger to automatically refresh updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donors_updated_at
    BEFORE UPDATE ON public.donors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
    BEFORE UPDATE ON public.blood_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Zero public read access to donors or blood requests!
-- ==============================================================================

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- DONORS POLICIES:
-- 1. Public / Anon users can ONLY insert (register as donor)
CREATE POLICY "Public donor registration allowed"
    ON public.donors
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 2. ONLY authenticated administrators can SELECT donors
CREATE POLICY "Authenticated admins can view donors"
    ON public.donors
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. ONLY authenticated administrators can UPDATE donors
CREATE POLICY "Authenticated admins can update donors"
    ON public.donors
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. ONLY authenticated administrators can DELETE donors
CREATE POLICY "Authenticated admins can delete donors"
    ON public.donors
    FOR DELETE
    TO authenticated
    USING (true);

-- BLOOD REQUESTS POLICIES:
-- 1. Public / Anon users can ONLY insert (submit blood request)
CREATE POLICY "Public blood request submission allowed"
    ON public.blood_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 2. ONLY authenticated administrators can SELECT blood requests
CREATE POLICY "Authenticated admins can view blood requests"
    ON public.blood_requests
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. ONLY authenticated administrators can UPDATE blood requests
CREATE POLICY "Authenticated admins can update blood requests"
    ON public.blood_requests
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. ONLY authenticated administrators can DELETE blood requests
CREATE POLICY "Authenticated admins can delete blood requests"
    ON public.blood_requests
    FOR DELETE
    TO authenticated
    USING (true);

-- ACTIVITY LOGS POLICIES:
-- ONLY authenticated administrators can view activity logs
CREATE POLICY "Authenticated admins can view activity logs"
    ON public.activity_logs
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated admins can insert activity logs"
    ON public.activity_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ADMIN PROFILES POLICIES:
CREATE POLICY "Authenticated users can read admin profiles"
    ON public.admin_profiles
    FOR SELECT
    TO authenticated
    USING (true);
