-- ============================================================================
-- Pet Care Application - PostgreSQL Schema (Cleaned)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- COMMON FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION create_updated_at_trigger(table_name text)
LANGUAGE plpgsql AS $$
BEGIN
    EXECUTE format(
        'CREATE TRIGGER %I
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION touch_updated_at()',
        table_name || '_touch_updated_at',
        table_name
    );
END;
$$;

-- ============================================================================
-- AUTH & AUTHORIZATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    action text,
    resource text,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    phone text UNIQUE,
    password_hash text,
    first_name text,
    last_name text,
    display_name text,
    avatar_url text,
    bio text,
    is_email_verified boolean NOT NULL DEFAULT FALSE,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','suspended','disabled')),
    last_login_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    is_primary boolean NOT NULL DEFAULT FALSE,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_permissions (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted boolean NOT NULL DEFAULT TRUE,
    granted_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS password_resets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    token_hash text,
    expires_at timestamptz NOT NULL,
    used boolean NOT NULL DEFAULT FALSE,
    consumed_at timestamptz,
    request_ip inet,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets (user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets (expires_at);

CREATE TABLE IF NOT EXISTS email_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    used boolean NOT NULL DEFAULT FALSE,
    verified_at timestamptz,
    request_ip inet,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON email_verifications (token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications (expires_at);


CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource text NOT NULL,
    changes jsonb,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);

-- ============================================================================
-- PET MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS pet_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    status smallint NOT NULL DEFAULT 1,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_types_name ON pet_types (lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_types_slug ON pet_types (lower(slug));

CREATE TABLE IF NOT EXISTS breeds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text,
    pet_type_id uuid NOT NULL REFERENCES pet_types(id) ON DELETE CASCADE,
    description text,
    status smallint NOT NULL DEFAULT 1,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_breeds_pet_type_id ON breeds (pet_type_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_breeds_name_pet_type ON breeds (lower(name), pet_type_id);

CREATE TABLE IF NOT EXISTS pets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text,
    pet_type_id uuid NOT NULL REFERENCES pet_types(id) ON DELETE RESTRICT,
    breed_id uuid REFERENCES breeds(id) ON DELETE SET NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    size text,
    gender text,
    date_of_birth timestamptz,
    age text,
    weight double precision,
    height double precision,
    weight_unit text,
    height_unit text,
    additional_info jsonb,
    status smallint NOT NULL DEFAULT 1,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets (user_id);
CREATE INDEX IF NOT EXISTS idx_pets_pet_type_id ON pets (pet_type_id);
CREATE INDEX IF NOT EXISTS idx_pets_breed_id ON pets (breed_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pets_user_slug ON pets (user_id, lower(slug));

-- ============================================================================
-- VETERINARY INFRASTRUCTURE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vet_clinics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    license_number text,
    description text,
    specializations jsonb,
    branch_id uuid,
    contact_email text NOT NULL,
    contact_number text NOT NULL,
    emergency_number text,
    status smallint NOT NULL DEFAULT 1,
    is_emergency_available boolean NOT NULL DEFAULT FALSE,
    is_24x7 boolean NOT NULL DEFAULT FALSE,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vet_clinics_slug ON vet_clinics (lower(slug));
CREATE INDEX IF NOT EXISTS idx_vet_clinics_branch_id ON vet_clinics (branch_id);

CREATE TABLE IF NOT EXISTS veterinarians (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_id uuid,
    license_number text NOT NULL UNIQUE,
    specialization text,
    qualification jsonb,
    experience_years int NOT NULL DEFAULT 0,
    consultation_fee numeric(10,2) NOT NULL DEFAULT 0.00,
    emergency_fee numeric(10,2) NOT NULL DEFAULT 0.00,
    bio text,
    avatar_url text,
    status smallint NOT NULL DEFAULT 1,
    is_available_for_emergency boolean NOT NULL DEFAULT FALSE,
    rating numeric(3,2) DEFAULT 0.00,
    total_appointments int NOT NULL DEFAULT 0,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_veterinarians_license ON veterinarians (lower(license_number));
CREATE INDEX IF NOT EXISTS idx_veterinarians_employee_id ON veterinarians (employee_id);
CREATE INDEX IF NOT EXISTS idx_veterinarians_user_id ON veterinarians (user_id);

CREATE TABLE IF NOT EXISTS vet_clinic_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    veterinarian_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
    clinic_id uuid NOT NULL REFERENCES vet_clinics(id) ON DELETE CASCADE,
    is_primary boolean NOT NULL DEFAULT FALSE,
    consultation_fee_override numeric(10,2),
    service_ids jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vet_clinic_mappings_vet_clinic ON vet_clinic_mappings (veterinarian_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_vet_clinic_mappings_vet_id ON vet_clinic_mappings (veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_vet_clinic_mappings_clinic_id ON vet_clinic_mappings (clinic_id);

CREATE TABLE IF NOT EXISTS vet_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE,
    name text NOT NULL,
    description text,
    default_duration_minutes int NOT NULL DEFAULT 30,
    default_fee numeric(10,2) NOT NULL DEFAULT 0.00,
    service_type text,
    status smallint NOT NULL DEFAULT 1,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vet_services_code ON vet_services (lower(code));
CREATE INDEX IF NOT EXISTS idx_vet_services_name ON vet_services (lower(name));

CREATE TABLE IF NOT EXISTS vet_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    veterinarian_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
    clinic_id uuid NOT NULL REFERENCES vet_clinics(id) ON DELETE CASCADE,
    day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time time NOT NULL,
    end_time time NOT NULL,
    slot_duration int NOT NULL DEFAULT 30,
    max_appointments_per_slot int NOT NULL DEFAULT 1,
    is_available boolean NOT NULL DEFAULT TRUE,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vet_schedules_vet_id ON vet_schedules (veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_vet_schedules_clinic_id ON vet_schedules (clinic_id);

CREATE TABLE IF NOT EXISTS vet_schedule_exceptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    veterinarian_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES vet_clinics(id) ON DELETE SET NULL,
    exception_date date NOT NULL,
    exception_type text NOT NULL CHECK (exception_type IN ('leave','holiday','emergency','conference','other')),
    start_time time,
    end_time time,
    reason text,
    is_recurring boolean NOT NULL DEFAULT FALSE,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vet_exceptions_vet_id ON vet_schedule_exceptions (veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_vet_exceptions_date ON vet_schedule_exceptions (exception_date);

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS vet_appointment_seq START 1;

CREATE OR REPLACE FUNCTION generate_appointment_number(p_clinic_id uuid)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
    clinic_slug text;
    datepart text;
BEGIN
    datepart := to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDD');
    SELECT COALESCE(
        lower(regexp_replace(slug, '[^a-z0-9]+', '', 'g')),
        lower(regexp_replace(name, '\s+', '', 'g')),
        'CLIN'
    ) INTO clinic_slug
    FROM vet_clinics WHERE id = p_clinic_id;

    RETURN format('APPT-%s-%s-%06d', clinic_slug, datepart, nextval('vet_appointment_seq'));
END;
$$;

CREATE OR REPLACE FUNCTION vet_appointments_assign_number()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.appointment_number IS NULL OR NEW.appointment_number = '' THEN
        NEW.appointment_number := generate_appointment_number(NEW.clinic_id);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS vet_appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_number text NOT NULL UNIQUE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    veterinarian_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
    clinic_id uuid NOT NULL REFERENCES vet_clinics(id) ON DELETE CASCADE,
    service_id uuid REFERENCES vet_services(id) ON DELETE SET NULL,
    appointment_date date NOT NULL,
    appointment_time time NOT NULL,
    vet_service_ids jsonb DEFAULT '[]'::jsonb CHECK (vet_service_ids IS NULL OR jsonb_typeof(vet_service_ids) = 'array'),
    duration_minutes int NOT NULL DEFAULT 30,
    appointment_type text NOT NULL DEFAULT 'consultation' CHECK (appointment_type IN ('consultation','checkup','vaccination','surgery','emergency','followup','telemedicine')),
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','in_progress','completed','cancelled','no_show','rescheduled')),
    priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','urgent','emergency')),
    chief_complaint text,
    symptoms jsonb,
    notes text,
    consultation_fee numeric(10,2) NOT NULL DEFAULT 0.00,
    service_fee numeric(10,2) NOT NULL DEFAULT 0.00,
    additional_charges numeric(10,2) NOT NULL DEFAULT 0.00,
    total_amount numeric(10,2) NOT NULL DEFAULT 0.00,
    payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','partially_paid','refunded')),
    reminder_sent boolean NOT NULL DEFAULT FALSE,
    reminder_sent_at timestamptz,
    checked_in_at timestamptz,
    checked_out_at timestamptz,
    cancelled_at timestamptz,
    cancellation_reason text,
    cancelled_by text CHECK (cancelled_by IN ('user','veterinarian','admin','system')),
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vet_appointments_user_id ON vet_appointments (user_id);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_pet_id ON vet_appointments (pet_id);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_date ON vet_appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_status ON vet_appointments (status);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_vet_id ON vet_appointments (veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_clinic_id ON vet_appointments (clinic_id);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_service_id ON vet_appointments (service_id);

CREATE TABLE IF NOT EXISTS vet_appointment_reschedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
    old_date date NOT NULL,
    old_time time NOT NULL,
    new_date date NOT NULL,
    new_time time NOT NULL,
    reason text,
    rescheduled_by text NOT NULL CHECK (rescheduled_by IN ('user','veterinarian','admin')),
    rescheduled_by_id uuid,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vet_reschedules_appointment_id ON vet_appointment_reschedules (appointment_id);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vet_appointment_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_id uuid REFERENCES pet_insurance_policies(id) ON DELETE SET NULL,
    claim_id uuid REFERENCES pet_insurance_claims(id) ON DELETE SET NULL,
    payment_method text,
    transaction_id text,
    consultation_fee numeric(10,2) NOT NULL DEFAULT 0.00,
    other_charges numeric(10,2) NOT NULL DEFAULT 0.00,
    subtotal numeric(10,2) NOT NULL DEFAULT 0.00,
    discount_amount numeric(10,2) NOT NULL DEFAULT 0.00,
    tax_amount numeric(10,2) NOT NULL DEFAULT 0.00,
    total_amount numeric(10,2) NOT NULL DEFAULT 0.00,
    paid_amount numeric(10,2) NOT NULL DEFAULT 0.00,
    payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','partially_paid','refunded','failed')),
    payment_date timestamptz,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vet_payments_appointment_id ON vet_appointment_payments (appointment_id);
CREATE INDEX IF NOT EXISTS idx_vet_payments_user_id ON vet_appointment_payments (user_id);

CREATE TABLE IF NOT EXISTS vet_payment_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id uuid NOT NULL REFERENCES vet_appointment_payments(id) ON DELETE CASCADE,
    transaction_type text NOT NULL CHECK (transaction_type IN ('user_payment','insurance_payment','refund','adjustment')),
    payment_method text,
    transaction_id text,
    amount numeric(10,2) NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','cancelled')),
    transaction_date timestamptz,
    gateway_response jsonb,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON vet_payment_transactions (payment_id);

-- ============================================================================
-- NOTIFICATIONS & REMINDERS
-- ============================================================================

-- Appointment Reminders
CREATE TABLE IF NOT EXISTS vet_appointment_reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
    reminder_type text NOT NULL CHECK (reminder_type IN ('sms','email','push','whatsapp')),
    scheduled_time timestamptz NOT NULL,
    sent_at timestamptz,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
    error_message text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vet_reminders_appointment_id ON vet_appointment_reminders (appointment_id);

-- ============================================================================
-- WAITING QUEUE
-- ============================================================================

-- Appointment Queue (for clinic waiting management)
CREATE TABLE IF NOT EXISTS vet_appointment_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
    clinic_id uuid NOT NULL REFERENCES vet_clinics(id) ON DELETE CASCADE,
    queue_number int,
    priority int NOT NULL DEFAULT 0,
    checked_in_at timestamptz,
    called_at timestamptz,
    started_at timestamptz,
    completed_at timestamptz,
    estimated_wait_time int,
    status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','called','in_progress','completed','cancelled')),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vet_queue_appointment_id ON vet_appointment_queue (appointment_id);
CREATE INDEX IF NOT EXISTS idx_vet_queue_clinic_id ON vet_appointment_queue (clinic_id);

-- ============================================================================
-- REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vet_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
    veterinarian_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating numeric(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_text text,
    professionalism_rating smallint CHECK (professionalism_rating BETWEEN 1 AND 5),
    knowledge_rating smallint CHECK (knowledge_rating BETWEEN 1 AND 5),
    communication_rating smallint CHECK (communication_rating BETWEEN 1 AND 5),
    facility_rating smallint CHECK (facility_rating BETWEEN 1 AND 5),
    is_anonymous boolean NOT NULL DEFAULT FALSE,
    is_verified boolean NOT NULL DEFAULT TRUE,
    status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vet_reviews_appointment_id ON vet_reviews (appointment_id);
CREATE INDEX IF NOT EXISTS idx_vet_reviews_vet_id ON vet_reviews (veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_vet_reviews_user_id ON vet_reviews (user_id);

-- ============================================================================
-- MEDICAL RECORDS, PRESCRIPTIONS, LAB TESTS & VACCINATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vet_medical_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
    pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    veterinarian_id uuid REFERENCES veterinarians(id) ON DELETE SET NULL,
    record_date timestamptz NOT NULL DEFAULT now(),
    record_type text NOT NULL CHECK (record_type IN ('consultation', 'surgery', 'vaccination', 'checkup', 'emergency', 'followup')),
    diagnosis text,
    symptoms jsonb,
    vital_signs jsonb,
    physical_examination text,
    treatment_plan text,
    recommendations text,
    followup_required boolean NOT NULL DEFAULT FALSE,
    followup_date date,
    notes text,
    is_confidential boolean NOT NULL DEFAULT FALSE,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vet_medical_records_appointment_id ON vet_medical_records (appointment_id);
CREATE INDEX IF NOT EXISTS idx_vet_medical_records_pet_id ON vet_medical_records (pet_id);
CREATE INDEX IF NOT EXISTS idx_vet_medical_records_vet_id ON vet_medical_records (veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_vet_medical_records_record_date ON vet_medical_records (record_date);
CREATE INDEX IF NOT EXISTS idx_vet_medical_records_deleted_at ON vet_medical_records (deleted_at);

CREATE TABLE IF NOT EXISTS vet_prescriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id uuid NOT NULL REFERENCES vet_medical_records(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES vet_appointments(id) ON DELETE SET NULL,
    pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    veterinarian_id uuid REFERENCES veterinarians(id) ON DELETE SET NULL,
    prescription_number text NOT NULL UNIQUE,
    prescription_date date NOT NULL DEFAULT CURRENT_DATE,
    valid_until date,
    notes text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','expired','cancelled')),
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vet_prescriptions_record_id ON vet_prescriptions (medical_record_id);
CREATE INDEX IF NOT EXISTS idx_vet_prescriptions_appointment_id ON vet_prescriptions (appointment_id);
CREATE INDEX IF NOT EXISTS idx_vet_prescriptions_pet_id ON vet_prescriptions (pet_id);
CREATE INDEX IF NOT EXISTS idx_vet_prescriptions_status ON vet_prescriptions (status);
CREATE INDEX IF NOT EXISTS idx_vet_prescriptions_deleted_at ON vet_prescriptions (deleted_at);

CREATE TABLE IF NOT EXISTS vet_prescription_medications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id uuid NOT NULL REFERENCES vet_prescriptions(id) ON DELETE CASCADE,
    medication_name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    duration text NOT NULL,
    route text,
    instructions text,
    quantity text,
    refills_allowed int DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vet_medications_prescription_id ON vet_prescription_medications (prescription_id);

CREATE TABLE IF NOT EXISTS vet_lab_tests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id uuid REFERENCES vet_medical_records(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES vet_appointments(id) ON DELETE SET NULL,
    pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
    test_name text NOT NULL,
    test_type text,
    ordered_date date NOT NULL DEFAULT CURRENT_DATE,
    sample_collected_date timestamptz,
    result_date timestamptz,
    status text NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered','sample_collected','processing','completed','cancelled')),
    results jsonb,
    normal_range text,
    interpretation text,
    lab_name text,
    urgency text NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine','urgent','stat')),
    cost numeric(10,2) NOT NULL DEFAULT 0.00,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vet_lab_tests_record_id ON vet_lab_tests (medical_record_id);
CREATE INDEX IF NOT EXISTS idx_vet_lab_tests_pet_id ON vet_lab_tests (pet_id);
CREATE INDEX IF NOT EXISTS idx_vet_lab_tests_status ON vet_lab_tests (status);
CREATE INDEX IF NOT EXISTS idx_vet_lab_tests_deleted_at ON vet_lab_tests (deleted_at);

CREATE TABLE IF NOT EXISTS vet_vaccinations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES vet_appointments(id) ON DELETE SET NULL,
    veterinarian_id uuid REFERENCES veterinarians(id) ON DELETE SET NULL,
    vaccine_name text NOT NULL,
    vaccine_type text,
    manufacturer text,
    batch_number text,
    vaccination_date date NOT NULL,
    next_due_date date,
    site_of_injection text,
    adverse_reactions text,
    cost numeric(10,2) NOT NULL DEFAULT 0.00,
    notes text,
    certificate_issued boolean NOT NULL DEFAULT FALSE,
    certificate_number text,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_vet_vaccinations_pet_id ON vet_vaccinations (pet_id);
CREATE INDEX IF NOT EXISTS idx_vet_vaccinations_appointment_id ON vet_vaccinations (appointment_id);
CREATE INDEX IF NOT EXISTS idx_vet_vaccinations_vaccination_date ON vet_vaccinations (vaccination_date);
CREATE INDEX IF NOT EXISTS idx_vet_vaccinations_next_due_date ON vet_vaccinations (next_due_date);
CREATE INDEX IF NOT EXISTS idx_vet_vaccinations_deleted_at ON vet_vaccinations (deleted_at);

-- Add medical_record_id to vet_vaccinations (idempotent)
ALTER TABLE vet_vaccinations
  ADD COLUMN IF NOT EXISTS medical_record_id uuid REFERENCES vet_medical_records(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vet_vaccinations_medical_record_id ON vet_vaccinations (medical_record_id);

-- Backfill existing vaccination records that can be associated with a medical record
UPDATE vet_vaccinations v
SET medical_record_id = mr.id
FROM vet_medical_records mr
WHERE v.appointment_id IS NOT NULL
  AND v.pet_id IS NOT NULL
  AND mr.appointment_id = v.appointment_id
  AND mr.pet_id = v.pet_id
  AND v.medical_record_id IS NULL;

-- ============================================================================
-- INSURANCE MANAGEMENT
-- ============================================================================

-- Insurance Providers
CREATE TABLE IF NOT EXISTS pet_insurance_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code varchar(50) NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    contact_email text,
    contact_phone text,
    website text,
    api_endpoint text,
    api_key text,
    claim_submission_method text NOT NULL DEFAULT 'email' CHECK (claim_submission_method IN ('online','email','portal','api')),
    claim_email text,
    average_processing_days integer DEFAULT 14,
    description text,
    terms_and_conditions text,
    coverage_details jsonb COMMENT 'Covered services, limits, etc.',
    status smallint NOT NULL DEFAULT 1,
    is_api_enabled boolean NOT NULL DEFAULT FALSE,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_providers_code ON pet_insurance_providers (code);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_providers_status ON pet_insurance_providers (status);

-- Insurance Plans offered by providers
CREATE TABLE IF NOT EXISTS pet_insurance_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid NOT NULL REFERENCES pet_insurance_providers(id) ON DELETE CASCADE,
    plan_name text NOT NULL,
    plan_code varchar(50) NOT NULL UNIQUE,
    plan_type text NOT NULL CHECK (plan_type IN ('basic','standard','premium','comprehensive','accident_only','wellness')),
    description text,
    coverage_limit_annual numeric(12,2),
    deductible_amount numeric(12,2) DEFAULT 0,
    reimbursement_percentage numeric(5,2) DEFAULT 80.00,
    waiting_period_days integer DEFAULT 14,
    wellness_coverage boolean NOT NULL DEFAULT FALSE,
    dental_coverage boolean NOT NULL DEFAULT FALSE,
    hereditary_coverage boolean NOT NULL DEFAULT FALSE,
    prescription_coverage boolean NOT NULL DEFAULT FALSE,
    emergency_coverage boolean NOT NULL DEFAULT TRUE,
    surgery_coverage boolean NOT NULL DEFAULT TRUE,
    covered_services jsonb,
    excluded_conditions jsonb,
    age_restrictions text,
    status smallint NOT NULL DEFAULT 1,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_plans_provider_id ON pet_insurance_plans (provider_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_plans_code ON pet_insurance_plans (plan_code);

-- Pet Insurance Policies (user's active insurance)
CREATE TABLE IF NOT EXISTS pet_insurance_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_number varchar(100) NOT NULL UNIQUE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    provider_id uuid NOT NULL REFERENCES pet_insurance_providers(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES pet_insurance_plans(id) ON DELETE CASCADE,
    policy_holder_name text NOT NULL,
    policy_start_date date NOT NULL,
    policy_end_date date NOT NULL,
    renewal_date date,
    premium_amount numeric(12,2) NOT NULL DEFAULT 0,
    premium_frequency text NOT NULL DEFAULT 'monthly' CHECK (premium_frequency IN ('monthly','quarterly','semi_annual','annual')),
    coverage_limit_annual numeric(12,2) NOT NULL DEFAULT 0,
    coverage_used_ytd numeric(12,2) NOT NULL DEFAULT 0,
    deductible_amount numeric(12,2) NOT NULL DEFAULT 0,
    deductible_met_ytd numeric(12,2) NOT NULL DEFAULT 0,
    reimbursement_percentage numeric(5,2) NOT NULL DEFAULT 80.00,
    waiting_period_end_date date,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','suspended','pending')),
    cancellation_date date,
    cancellation_reason text,
    pre_existing_conditions jsonb,
    special_conditions text,
    documents jsonb,
    notes text,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_user_id ON pet_insurance_policies (user_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_pet_id ON pet_insurance_policies (pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_provider_id ON pet_insurance_policies (provider_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_plan_id ON pet_insurance_policies (plan_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_policies_status ON pet_insurance_policies (status);

-- Insurance Claims
CREATE TABLE IF NOT EXISTS pet_insurance_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number varchar(100) NOT NULL UNIQUE,
    policy_id uuid NOT NULL REFERENCES pet_insurance_policies(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES vet_appointments(id) ON DELETE SET NULL,
    medical_record_id uuid REFERENCES vet_medical_records(id) ON DELETE SET NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    provider_id uuid NOT NULL REFERENCES pet_insurance_providers(id) ON DELETE CASCADE,
    claim_type text NOT NULL CHECK (claim_type IN ('medical','surgical','emergency','wellness','prescription','diagnostic','preventive')),
    incident_date date NOT NULL,
    claim_date date NOT NULL,
    diagnosis text,
    treatment_description text,
    veterinarian_name text,
    clinic_name text,
    total_billed_amount numeric(12,2) NOT NULL DEFAULT 0,
    eligible_amount numeric(12,2) NOT NULL DEFAULT 0,
    deductible_applied numeric(12,2) NOT NULL DEFAULT 0,
    reimbursement_percentage numeric(5,2) NOT NULL DEFAULT 80.00,
    approved_amount numeric(12,2) DEFAULT 0,
    reimbursed_amount numeric(12,2) DEFAULT 0,
    denied_amount numeric(12,2) DEFAULT 0,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','approved','partially_approved','denied','paid','withdrawn')),
    submission_date timestamptz,
    review_date timestamptz,
    approval_date timestamptz,
    payment_date timestamptz,
    expected_reimbursement_date date,
    denial_reason text,
    denial_code varchar(50),
    reviewer_notes text,
    adjuster_name text,
    payment_method text DEFAULT 'direct_deposit' CHECK (payment_method IN ('direct_deposit','check','bank_transfer')),
    payment_reference varchar(191),
    documents_submitted jsonb,
    additional_info_requested text,
    appeal_status text DEFAULT 'not_appealed' CHECK (appeal_status IN ('not_appealed','appealed','appeal_approved','appeal_denied')),
    appeal_date date,
    appeal_notes text,
    notes text,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_claims_policy_id ON pet_insurance_claims (policy_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_claims_appointment_id ON pet_insurance_claims (appointment_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_claims_user_id ON pet_insurance_claims (user_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_claims_pet_id ON pet_insurance_claims (pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_claims_status ON pet_insurance_claims (status);

-- Claim Line Items (breakdown of services claimed)
CREATE TABLE IF NOT EXISTS pet_insurance_claim_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id uuid NOT NULL REFERENCES pet_insurance_claims(id) ON DELETE CASCADE,
    service_type text NOT NULL,
    service_description text,
    service_date date NOT NULL,
    procedure_code varchar(50),
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(12,2) NOT NULL DEFAULT 0,
    total_amount numeric(12,2) NOT NULL DEFAULT 0,
    eligible_amount numeric(12,2) NOT NULL DEFAULT 0,
    approved_amount numeric(12,2) DEFAULT 0,
    denial_reason text,
    is_approved boolean,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_claim_items_claim_id ON pet_insurance_claim_items (claim_id);

-- Claim Status History
CREATE TABLE IF NOT EXISTS pet_insurance_claim_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id uuid NOT NULL REFERENCES pet_insurance_claims(id) ON DELETE CASCADE,
    status text NOT NULL,
    notes text,
    changed_by text,
    changed_by_id uuid,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_claim_history_claim_id ON pet_insurance_claim_history (claim_id);

-- Pre-Authorization Requests (for planned procedures)
CREATE TABLE IF NOT EXISTS pet_insurance_preauthorizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_number varchar(100) NOT NULL UNIQUE,
    policy_id uuid NOT NULL REFERENCES pet_insurance_policies(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    provider_id uuid NOT NULL REFERENCES pet_insurance_providers(id) ON DELETE CASCADE,
    veterinarian_id uuid REFERENCES veterinarians(id) ON DELETE SET NULL,
    clinic_id uuid REFERENCES vet_clinics(id) ON DELETE SET NULL,
    procedure_type text NOT NULL,
    procedure_description text,
    diagnosis text,
    estimated_cost numeric(12,2) NOT NULL DEFAULT 0,
    requested_date date NOT NULL,
    proposed_procedure_date date,
    urgency text NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine','urgent','emergency')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied','expired','cancelled')),
    approval_date timestamptz,
    expiry_date date,
    approved_amount numeric(12,2) DEFAULT 0,
    conditions text,
    denial_reason text,
    reference_number varchar(100),
    supporting_documents jsonb,
    reviewer_notes text,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_preauth_policy_id ON pet_insurance_preauthorizations (policy_id);
CREATE INDEX IF NOT EXISTS idx_pet_insurance_preauth_status ON pet_insurance_preauthorizations (status);

-- Insurance Eligibility Verification (real-time checks)
CREATE TABLE IF NOT EXISTS pet_insurance_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id uuid NOT NULL REFERENCES pet_insurance_policies(id) ON DELETE CASCADE,
    verification_date timestamptz NOT NULL,
    verification_type text NOT NULL DEFAULT 'api' CHECK (verification_type IN ('manual','api','phone')),
    coverage_status text NOT NULL CHECK (coverage_status IN ('active','inactive','suspended','unknown')),
    coverage_remaining numeric(12,2),
    deductible_remaining numeric(12,2),
    benefits_available jsonb,
    verification_response text,
    verified_by text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_verifications_policy_id ON pet_insurance_verifications (policy_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DO $$
DECLARE
    tables text[] := ARRAY[
        'roles', 'permissions', 'users', 'pet_types', 'breeds', 'pets',
        'vet_clinics', 'veterinarians', 'vet_clinic_mappings', 'vet_services',
        'vet_schedules', 'vet_appointments', 'vet_appointment_payments',
        'vet_payment_transactions', 'vet_appointment_reminders',
        'vet_appointment_queue', 'vet_reviews', 'vet_medical_records', 'vet_prescriptions', 'vet_prescription_medications', 'vet_lab_tests', 'vet_vaccinations',
        'pet_insurance_providers', 'pet_insurance_plans', 'pet_insurance_policies', 'pet_insurance_claims', 'pet_insurance_preauthorizations'
    ];
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', tbl || '_touch_updated_at', tbl);
        EXECUTE format(
            'CREATE TRIGGER %I
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION touch_updated_at()',
            tbl || '_touch_updated_at',
            tbl
        );
    END LOOP;

    -- Special: appointment number assignment
    EXECUTE format(
        'DROP TRIGGER IF EXISTS vet_appointments_assign_number_trigger ON vet_appointments'
    );
    EXECUTE format(
        'CREATE TRIGGER vet_appointments_assign_number_trigger
         BEFORE INSERT ON vet_appointments
         FOR EACH ROW EXECUTE FUNCTION vet_appointments_assign_number()'
    );
END;
$$ LANGUAGE plpgsql;


