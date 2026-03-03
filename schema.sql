--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: generate_appointment_number(uuid); Type: FUNCTION; Schema: public; Owner: dbadmin
--

CREATE FUNCTION public.generate_appointment_number(p_clinic_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
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

    -- Use to_char to produce zero-padded sequence (Postgres format() does not support %d)
    RETURN format('APPT-%s-%s-%s', clinic_slug, datepart, to_char(nextval('vet_appointment_seq'), 'FM000000'));
END;
$$;


ALTER FUNCTION public.generate_appointment_number(p_clinic_id uuid) OWNER TO dbadmin;

--
-- Name: get_notification_template(text, text); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.get_notification_template(p_key text, p_locale text) RETURNS TABLE(template_id uuid, template_key text, channel text, subject text, body text, body_html text, variables jsonb)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.template_key, t.channel,
           COALESCE(tt.subject, t.default_subject) as subject,
           COALESCE(tt.body, t.default_body) as body,
           COALESCE(tt.body_html, t.default_body_html) as body_html,
           COALESCE(tt.variables, t.variables) as variables
    FROM notification_templates t
    LEFT JOIN LATERAL (
        SELECT tr.subject, tr.body, tr.body_html, tr.variables
        FROM notification_template_translations tr
        WHERE tr.template_id = t.id
          AND tr.locale IN (p_locale, split_part(p_locale, '-', 1))
        ORDER BY (tr.locale = p_locale) DESC, tr.is_default DESC
        LIMIT 1
    ) tt ON true
    WHERE t.template_key = p_key AND t.is_active = TRUE
    LIMIT 1;
END;
$$;


ALTER FUNCTION public.get_notification_template(p_key text, p_locale text) OWNER TO admin;

--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: dbadmin
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.touch_updated_at() OWNER TO dbadmin;

--
-- Name: vet_appointments_assign_number(); Type: FUNCTION; Schema: public; Owner: dbadmin
--

CREATE FUNCTION public.vet_appointments_assign_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.appointment_number IS NULL OR NEW.appointment_number = '' THEN
        NEW.appointment_number := generate_appointment_number(NEW.clinic_id);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.vet_appointments_assign_number() OWNER TO dbadmin;

--
-- Name: vet_recalc_appointment_totals(uuid); Type: FUNCTION; Schema: public; Owner: dbadmin
--

CREATE FUNCTION public.vet_recalc_appointment_totals(p_appointment_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_serv numeric(12,2);
BEGIN
    SELECT COALESCE(SUM((unit_fee * quantity) - COALESCE(discount_amount,0)),0) INTO total_serv
    FROM vet_appointment_services WHERE appointment_id = p_appointment_id;

    UPDATE vet_appointments
    SET consultation_fee = total_serv,
        total_amount = total_serv + COALESCE(additional_charges,0)
    WHERE id = p_appointment_id;
END;
$$;


ALTER FUNCTION public.vet_recalc_appointment_totals(p_appointment_id uuid) OWNER TO dbadmin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.app_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace text DEFAULT 'global'::text NOT NULL,
    key text NOT NULL,
    value jsonb,
    description text,
    is_secret boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.app_settings OWNER TO admin;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    resource text NOT NULL,
    changes jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO dbadmin;

--
-- Name: breeds; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.breeds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    slug text,
    pet_type_id uuid NOT NULL,
    description text,
    status smallint DEFAULT 1 NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.breeds OWNER TO dbadmin;

--
-- Name: email_verifications; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.email_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    token_hash text,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    verified_at timestamp with time zone,
    request_ip inet
);


ALTER TABLE public.email_verifications OWNER TO dbadmin;

--
-- Name: in_app_notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.in_app_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'general'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    target_type text DEFAULT 'user'::text NOT NULL,
    target_role text,
    action_url text,
    icon text,
    metadata jsonb,
    scheduled_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT in_app_notifications_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT in_app_notifications_status_check CHECK ((status = ANY (ARRAY['active'::text, 'scheduled'::text, 'expired'::text, 'deleted'::text]))),
    CONSTRAINT in_app_notifications_target_type_check CHECK ((target_type = ANY (ARRAY['user'::text, 'role'::text, 'broadcast'::text]))),
    CONSTRAINT in_app_notifications_type_check CHECK ((type = ANY (ARRAY['system'::text, 'appointment'::text, 'payment'::text, 'reminder'::text, 'promotion'::text, 'general'::text])))
);


ALTER TABLE public.in_app_notifications OWNER TO admin;

--
-- Name: notification_channels; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notification_channels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    provider text,
    config jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_channels OWNER TO admin;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notification_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notification_id uuid,
    channel text,
    provider text,
    provider_message_id text,
    status text NOT NULL,
    response jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_logs_status_check CHECK ((status = ANY (ARRAY['sent'::text, 'delivered'::text, 'failed'::text, 'undeliverable'::text])))
);


ALTER TABLE public.notification_logs OWNER TO admin;

--
-- Name: notification_template_translations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notification_template_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    locale text NOT NULL,
    subject text,
    body text,
    body_html text,
    variables jsonb,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_template_translations OWNER TO admin;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notification_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_key text NOT NULL,
    name text,
    channel text NOT NULL,
    description text,
    default_subject text,
    default_body text,
    default_body_html text,
    variables jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notification_templates_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'sms'::text, 'push'::text, 'whatsapp'::text, 'in_app'::text])))
);


ALTER TABLE public.notification_templates OWNER TO admin;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_key text NOT NULL,
    channel text NOT NULL,
    target jsonb,
    template_key text,
    locale text,
    payload jsonb,
    scheduled_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    error text,
    retry_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'cancelled'::text])))
);


ALTER TABLE public.notifications OWNER TO admin;

--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.password_resets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    token_hash text,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    consumed_at timestamp with time zone,
    request_ip inet
);


ALTER TABLE public.password_resets OWNER TO dbadmin;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    action text,
    resource text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.permissions OWNER TO dbadmin;

--
-- Name: pet_types; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.pet_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text,
    status smallint DEFAULT 1 NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    icon_url text
);


ALTER TABLE public.pet_types OWNER TO dbadmin;

--
-- Name: pets; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.pets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text,
    pet_type_id uuid NOT NULL,
    breed_id uuid,
    size text,
    date_of_birth timestamp with time zone,
    age text,
    gender text,
    weight double precision,
    height double precision,
    weight_unit text,
    height_unit text,
    user_id uuid NOT NULL,
    additional_info jsonb,
    status smallint DEFAULT 1 NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.pets OWNER TO dbadmin;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO dbadmin;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.roles OWNER TO dbadmin;

--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text DEFAULT 'home'::text NOT NULL,
    label text,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text,
    postal_code text,
    country text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    is_primary boolean DEFAULT false NOT NULL,
    status smallint DEFAULT 1 NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT user_addresses_type_check CHECK ((type = ANY (ARRAY['home'::text, 'work'::text, 'other'::text, 'billing'::text, 'shipping'::text])))
);


ALTER TABLE public.user_addresses OWNER TO admin;

--
-- Name: user_notification_preferences; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_key text NOT NULL,
    channel text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    lead_time interval,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_notification_preferences OWNER TO admin;

--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notification_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    is_archived boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_notifications OWNER TO admin;

--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.user_permissions (
    user_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO dbadmin;

--
-- Name: user_push_tokens; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_push_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    platform text,
    token text NOT NULL,
    metadata jsonb,
    is_active boolean DEFAULT true NOT NULL,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_push_tokens OWNER TO admin;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO dbadmin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    phone text,
    password_hash text,
    first_name text,
    last_name text,
    display_name text,
    avatar_url text,
    bio text,
    is_email_verified boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['active'::text, 'pending'::text, 'suspended'::text, 'disabled'::text])))
);


ALTER TABLE public.users OWNER TO dbadmin;

--
-- Name: vet_appointment_payments; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_appointment_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    payment_method text,
    transaction_id text,
    consultation_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    other_charges numeric(10,2) DEFAULT 0.00 NOT NULL,
    subtotal numeric(10,2) DEFAULT 0.00 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    payment_date timestamp with time zone,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vet_appointment_payments_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'partially_paid'::text, 'refunded'::text, 'failed'::text])))
);


ALTER TABLE public.vet_appointment_payments OWNER TO dbadmin;

--
-- Name: vet_appointment_queue; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_appointment_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    queue_number integer,
    priority integer DEFAULT 0 NOT NULL,
    checked_in_at timestamp with time zone,
    called_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    estimated_wait_time integer,
    status text DEFAULT 'waiting'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vet_appointment_queue_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'called'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


ALTER TABLE public.vet_appointment_queue OWNER TO dbadmin;

--
-- Name: vet_appointment_reminders; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_appointment_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    reminder_type text NOT NULL,
    scheduled_time timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vet_appointment_reminders_reminder_type_check CHECK ((reminder_type = ANY (ARRAY['sms'::text, 'email'::text, 'push'::text, 'whatsapp'::text]))),
    CONSTRAINT vet_appointment_reminders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text])))
);


ALTER TABLE public.vet_appointment_reminders OWNER TO dbadmin;

--
-- Name: vet_appointment_reschedules; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_appointment_reschedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    old_date date NOT NULL,
    old_time time without time zone NOT NULL,
    new_date date NOT NULL,
    new_time time without time zone NOT NULL,
    reason text,
    rescheduled_by text NOT NULL,
    rescheduled_by_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vet_appointment_reschedules_rescheduled_by_check CHECK ((rescheduled_by = ANY (ARRAY['user'::text, 'veterinarian'::text, 'admin'::text])))
);


ALTER TABLE public.vet_appointment_reschedules OWNER TO dbadmin;

--
-- Name: vet_appointment_seq; Type: SEQUENCE; Schema: public; Owner: dbadmin
--

CREATE SEQUENCE public.vet_appointment_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vet_appointment_seq OWNER TO dbadmin;

--
-- Name: vet_appointments; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_number text NOT NULL,
    user_id uuid NOT NULL,
    pet_id uuid NOT NULL,
    veterinarian_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    duration_minutes integer DEFAULT 30 NOT NULL,
    appointment_type text DEFAULT 'consultation'::text NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    chief_complaint text,
    symptoms jsonb,
    notes text,
    consultation_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    additional_charges numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    reminder_sent boolean DEFAULT false NOT NULL,
    reminder_sent_at timestamp with time zone,
    checked_in_at timestamp with time zone,
    checked_out_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    cancelled_by text,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    service_id uuid,
    service_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    vet_service_ids jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT vet_appointments_appointment_type_check CHECK ((appointment_type = ANY (ARRAY['consultation'::text, 'checkup'::text, 'vaccination'::text, 'surgery'::text, 'emergency'::text, 'followup'::text, 'telemedicine'::text]))),
    CONSTRAINT vet_appointments_cancelled_by_check CHECK ((cancelled_by = ANY (ARRAY['user'::text, 'veterinarian'::text, 'admin'::text, 'system'::text]))),
    CONSTRAINT vet_appointments_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'partially_paid'::text, 'refunded'::text]))),
    CONSTRAINT vet_appointments_priority_check CHECK ((priority = ANY (ARRAY['normal'::text, 'urgent'::text, 'emergency'::text]))),
    CONSTRAINT vet_appointments_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text, 'rescheduled'::text]))),
    CONSTRAINT vet_appointments_vet_service_ids_check CHECK (((vet_service_ids IS NULL) OR (jsonb_typeof(vet_service_ids) = 'array'::text)))
);


ALTER TABLE public.vet_appointments OWNER TO dbadmin;

--
-- Name: vet_clinic_mappings; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_clinic_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    veterinarian_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    consultation_fee_override numeric(10,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    service_ids jsonb
);


ALTER TABLE public.vet_clinic_mappings OWNER TO dbadmin;

--
-- Name: vet_clinics; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_clinics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    license_number text,
    description text,
    specializations jsonb,
    branch_id uuid,
    contact_email text NOT NULL,
    contact_number text NOT NULL,
    emergency_number text,
    status smallint DEFAULT 1 NOT NULL,
    is_emergency_available boolean DEFAULT false NOT NULL,
    is_24x7 boolean DEFAULT false NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.vet_clinics OWNER TO dbadmin;

--
-- Name: vet_lab_tests; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_lab_tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    medical_record_id uuid,
    appointment_id uuid,
    pet_id uuid,
    test_name text NOT NULL,
    test_type text,
    ordered_date date DEFAULT CURRENT_DATE NOT NULL,
    sample_collected_date timestamp with time zone,
    result_date timestamp with time zone,
    status text DEFAULT 'ordered'::text NOT NULL,
    results jsonb,
    normal_range text,
    interpretation text,
    lab_name text,
    urgency text DEFAULT 'routine'::text NOT NULL,
    cost numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT vet_lab_tests_status_check CHECK ((status = ANY (ARRAY['ordered'::text, 'sample_collected'::text, 'processing'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT vet_lab_tests_urgency_check CHECK ((urgency = ANY (ARRAY['routine'::text, 'urgent'::text, 'stat'::text])))
);


ALTER TABLE public.vet_lab_tests OWNER TO dbadmin;

--
-- Name: vet_medical_records; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_medical_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    pet_id uuid NOT NULL,
    veterinarian_id uuid,
    record_date timestamp with time zone DEFAULT now() NOT NULL,
    record_type text NOT NULL,
    diagnosis text,
    symptoms jsonb,
    vital_signs jsonb,
    physical_examination text,
    treatment_plan text,
    recommendations text,
    followup_required boolean DEFAULT false NOT NULL,
    followup_date date,
    notes text,
    is_confidential boolean DEFAULT false NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT vet_medical_records_record_type_check CHECK ((record_type = ANY (ARRAY['consultation'::text, 'surgery'::text, 'vaccination'::text, 'checkup'::text, 'emergency'::text, 'followup'::text])))
);


ALTER TABLE public.vet_medical_records OWNER TO dbadmin;

--
-- Name: vet_payment_transactions; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    transaction_type text NOT NULL,
    payment_method text,
    transaction_id text,
    amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    transaction_date timestamp with time zone,
    gateway_response jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vet_payment_transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text]))),
    CONSTRAINT vet_payment_transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['user_payment'::text, 'insurance_payment'::text, 'refund'::text, 'adjustment'::text])))
);


ALTER TABLE public.vet_payment_transactions OWNER TO dbadmin;

--
-- Name: vet_prescription_medications; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_prescription_medications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prescription_id uuid NOT NULL,
    medication_name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    duration text NOT NULL,
    route text,
    instructions text,
    quantity text,
    refills_allowed integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vet_prescription_medications OWNER TO dbadmin;

--
-- Name: vet_prescriptions; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_prescriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    medical_record_id uuid NOT NULL,
    appointment_id uuid,
    pet_id uuid NOT NULL,
    veterinarian_id uuid,
    prescription_number text NOT NULL,
    prescription_date date DEFAULT CURRENT_DATE NOT NULL,
    valid_until date,
    notes text,
    status text DEFAULT 'active'::text NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT vet_prescriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'expired'::text, 'cancelled'::text])))
);


ALTER TABLE public.vet_prescriptions OWNER TO dbadmin;

--
-- Name: vet_reviews; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    veterinarian_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating numeric(2,1) NOT NULL,
    review_text text,
    professionalism_rating smallint,
    knowledge_rating smallint,
    communication_rating smallint,
    facility_rating smallint,
    is_anonymous boolean DEFAULT false NOT NULL,
    is_verified boolean DEFAULT true NOT NULL,
    status text DEFAULT 'approved'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT vet_reviews_communication_rating_check CHECK (((communication_rating >= 1) AND (communication_rating <= 5))),
    CONSTRAINT vet_reviews_facility_rating_check CHECK (((facility_rating >= 1) AND (facility_rating <= 5))),
    CONSTRAINT vet_reviews_knowledge_rating_check CHECK (((knowledge_rating >= 1) AND (knowledge_rating <= 5))),
    CONSTRAINT vet_reviews_professionalism_rating_check CHECK (((professionalism_rating >= 1) AND (professionalism_rating <= 5))),
    CONSTRAINT vet_reviews_rating_check CHECK (((rating >= 1.0) AND (rating <= 5.0))),
    CONSTRAINT vet_reviews_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


ALTER TABLE public.vet_reviews OWNER TO dbadmin;

--
-- Name: vet_schedule_exceptions; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_schedule_exceptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    veterinarian_id uuid NOT NULL,
    clinic_id uuid,
    exception_date date NOT NULL,
    exception_type text NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    reason text,
    is_recurring boolean DEFAULT false NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vet_schedule_exceptions_exception_type_check CHECK ((exception_type = ANY (ARRAY['leave'::text, 'holiday'::text, 'emergency'::text, 'conference'::text, 'other'::text])))
);


ALTER TABLE public.vet_schedule_exceptions OWNER TO dbadmin;

--
-- Name: vet_schedules; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    veterinarian_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    day_of_week smallint NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    slot_duration integer DEFAULT 30 NOT NULL,
    max_appointments_per_slot integer DEFAULT 1 NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT vet_schedules_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


ALTER TABLE public.vet_schedules OWNER TO dbadmin;

--
-- Name: vet_services; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text,
    name text NOT NULL,
    description text,
    default_duration_minutes integer DEFAULT 30 NOT NULL,
    default_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    service_type text,
    status smallint DEFAULT 1 NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.vet_services OWNER TO dbadmin;

--
-- Name: vet_vaccinations; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.vet_vaccinations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pet_id uuid NOT NULL,
    appointment_id uuid,
    veterinarian_id uuid,
    vaccine_name text NOT NULL,
    vaccine_type text,
    manufacturer text,
    batch_number text,
    vaccination_date date NOT NULL,
    next_due_date date,
    site_of_injection text,
    adverse_reactions text,
    cost numeric(10,2) DEFAULT 0.00 NOT NULL,
    notes text,
    certificate_issued boolean DEFAULT false NOT NULL,
    certificate_number text,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    medical_record_id uuid
);


ALTER TABLE public.vet_vaccinations OWNER TO dbadmin;

--
-- Name: veterinarians; Type: TABLE; Schema: public; Owner: dbadmin
--

CREATE TABLE public.veterinarians (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid,
    license_number text NOT NULL,
    specialization text,
    qualification jsonb,
    experience_years integer DEFAULT 0 NOT NULL,
    consultation_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    emergency_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    bio text,
    avatar_url text,
    status smallint DEFAULT 1 NOT NULL,
    is_available_for_emergency boolean DEFAULT false NOT NULL,
    rating numeric(5,2) DEFAULT 0.00,
    total_appointments integer DEFAULT 0 NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    user_id uuid NOT NULL
);


ALTER TABLE public.veterinarians OWNER TO dbadmin;

--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: breeds breeds_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_pkey PRIMARY KEY (id);


--
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- Name: in_app_notifications in_app_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id);


--
-- Name: notification_channels notification_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_channels
    ADD CONSTRAINT notification_channels_pkey PRIMARY KEY (id);


--
-- Name: notification_channels notification_channels_slug_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_channels
    ADD CONSTRAINT notification_channels_slug_key UNIQUE (slug);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_template_translations notification_template_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_template_translations
    ADD CONSTRAINT notification_template_translations_pkey PRIMARY KEY (id);


--
-- Name: notification_template_translations notification_template_translations_template_id_locale_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_template_translations
    ADD CONSTRAINT notification_template_translations_template_id_locale_key UNIQUE (template_id, locale);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_template_key_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_template_key_key UNIQUE (template_key);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_token_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_token_key UNIQUE (token);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: pet_types pet_types_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pet_types
    ADD CONSTRAINT pet_types_pkey PRIMARY KEY (id);


--
-- Name: pets pets_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_slug_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_slug_key UNIQUE (slug);


--
-- Name: app_settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: veterinarians uk_veterinarians_user_id; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT uk_veterinarians_user_id UNIQUE (user_id);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_user_id_notification_key_chan_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_notification_key_chan_key UNIQUE (user_id, notification_key, channel);


--
-- Name: user_notifications user_notifications_notification_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_notification_id_user_id_key UNIQUE (notification_id, user_id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, permission_id);


--
-- Name: user_push_tokens user_push_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_push_tokens
    ADD CONSTRAINT user_push_tokens_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vet_appointment_payments vet_appointment_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_pkey PRIMARY KEY (id);


--
-- Name: vet_appointment_queue vet_appointment_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_queue
    ADD CONSTRAINT vet_appointment_queue_pkey PRIMARY KEY (id);


--
-- Name: vet_appointment_reminders vet_appointment_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_reminders
    ADD CONSTRAINT vet_appointment_reminders_pkey PRIMARY KEY (id);


--
-- Name: vet_appointment_reschedules vet_appointment_reschedules_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_reschedules
    ADD CONSTRAINT vet_appointment_reschedules_pkey PRIMARY KEY (id);


--
-- Name: vet_appointments vet_appointments_appointment_number_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_appointment_number_key UNIQUE (appointment_number);


--
-- Name: vet_appointments vet_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_pkey PRIMARY KEY (id);


--
-- Name: vet_clinic_mappings vet_clinic_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_clinic_mappings
    ADD CONSTRAINT vet_clinic_mappings_pkey PRIMARY KEY (id);


--
-- Name: vet_clinics vet_clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_clinics
    ADD CONSTRAINT vet_clinics_pkey PRIMARY KEY (id);


--
-- Name: vet_lab_tests vet_lab_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_pkey PRIMARY KEY (id);


--
-- Name: vet_medical_records vet_medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_pkey PRIMARY KEY (id);


--
-- Name: vet_payment_transactions vet_payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_payment_transactions
    ADD CONSTRAINT vet_payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: vet_prescription_medications vet_prescription_medications_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescription_medications
    ADD CONSTRAINT vet_prescription_medications_pkey PRIMARY KEY (id);


--
-- Name: vet_prescriptions vet_prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_pkey PRIMARY KEY (id);


--
-- Name: vet_prescriptions vet_prescriptions_prescription_number_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_prescription_number_key UNIQUE (prescription_number);


--
-- Name: vet_reviews vet_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_reviews
    ADD CONSTRAINT vet_reviews_pkey PRIMARY KEY (id);


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_pkey PRIMARY KEY (id);


--
-- Name: vet_schedules vet_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_pkey PRIMARY KEY (id);


--
-- Name: vet_services vet_services_code_key; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_services
    ADD CONSTRAINT vet_services_code_key UNIQUE (code);


--
-- Name: vet_services vet_services_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_services
    ADD CONSTRAINT vet_services_pkey PRIMARY KEY (id);


--
-- Name: vet_vaccinations vet_vaccinations_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_pkey PRIMARY KEY (id);


--
-- Name: veterinarians veterinarians_pkey; Type: CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_pkey PRIMARY KEY (id);


--
-- Name: email_verifications_expires_at_idx; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX email_verifications_expires_at_idx ON public.email_verifications USING btree (expires_at);


--
-- Name: email_verifications_token_hash_idx; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX email_verifications_token_hash_idx ON public.email_verifications USING btree (token_hash);


--
-- Name: email_verifications_user_id_idx; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX email_verifications_user_id_idx ON public.email_verifications USING btree (user_id);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_breeds_name_pet_type; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE UNIQUE INDEX idx_breeds_name_pet_type ON public.breeds USING btree (lower(name), pet_type_id);


--
-- Name: idx_breeds_pet_type_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_breeds_pet_type_id ON public.breeds USING btree (pet_type_id);


--
-- Name: idx_in_app_notifications_created_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_in_app_notifications_created_at ON public.in_app_notifications USING btree (created_at DESC);


--
-- Name: idx_in_app_notifications_created_by; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_in_app_notifications_created_by ON public.in_app_notifications USING btree (created_by);


--
-- Name: idx_in_app_notifications_scheduled; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_in_app_notifications_scheduled ON public.in_app_notifications USING btree (scheduled_at);


--
-- Name: idx_in_app_notifications_status; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_in_app_notifications_status ON public.in_app_notifications USING btree (status);


--
-- Name: idx_in_app_notifications_target; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_in_app_notifications_target ON public.in_app_notifications USING btree (target_type);


--
-- Name: idx_in_app_notifications_type; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_in_app_notifications_type ON public.in_app_notifications USING btree (type);


--
-- Name: idx_notification_channels_slug; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_notification_channels_slug ON public.notification_channels USING btree (lower(slug));


--
-- Name: idx_notification_logs_notification_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_notification_logs_notification_id ON public.notification_logs USING btree (notification_id);


--
-- Name: idx_notification_template_translations_locale; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_notification_template_translations_locale ON public.notification_template_translations USING btree (locale);


--
-- Name: idx_notification_templates_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_notification_templates_key ON public.notification_templates USING btree (lower(template_key));


--
-- Name: idx_notifications_scheduled_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_notifications_scheduled_at ON public.notifications USING btree (scheduled_at);


--
-- Name: idx_notifications_status; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_password_resets_expires_at; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_password_resets_expires_at ON public.password_resets USING btree (expires_at);


--
-- Name: idx_password_resets_user_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_password_resets_user_id ON public.password_resets USING btree (user_id);


--
-- Name: idx_payment_transactions_payment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_payment_transactions_payment_id ON public.vet_payment_transactions USING btree (payment_id);


--
-- Name: idx_pet_types_name; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE UNIQUE INDEX idx_pet_types_name ON public.pet_types USING btree (lower(name));


--
-- Name: idx_pet_types_slug; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE UNIQUE INDEX idx_pet_types_slug ON public.pet_types USING btree (lower(slug));


--
-- Name: idx_pets_breed_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_pets_breed_id ON public.pets USING btree (breed_id);


--
-- Name: idx_pets_pet_type_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_pets_pet_type_id ON public.pets USING btree (pet_type_id);


--
-- Name: idx_pets_user_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_pets_user_id ON public.pets USING btree (user_id);


--
-- Name: idx_pets_user_slug; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE UNIQUE INDEX idx_pets_user_slug ON public.pets USING btree (user_id, lower(slug));


--
-- Name: idx_settings_key_namespace; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX idx_settings_key_namespace ON public.app_settings USING btree (namespace, lower(key));


--
-- Name: idx_user_addresses_is_primary; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_addresses_is_primary ON public.user_addresses USING btree (user_id, is_primary);


--
-- Name: idx_user_addresses_postal_code; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_addresses_postal_code ON public.user_addresses USING btree (postal_code);


--
-- Name: idx_user_addresses_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_addresses_user_id ON public.user_addresses USING btree (user_id);


--
-- Name: idx_user_notification_preferences_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_notification_preferences_user_id ON public.user_notification_preferences USING btree (user_id);


--
-- Name: idx_user_notifications_created_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_notifications_created_at ON public.user_notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_user_notifications_notification_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_notifications_notification_id ON public.user_notifications USING btree (notification_id);


--
-- Name: idx_user_notifications_unread; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_notifications_unread ON public.user_notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_user_notifications_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_notifications_user_id ON public.user_notifications USING btree (user_id);


--
-- Name: idx_user_push_tokens_token; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_push_tokens_token ON public.user_push_tokens USING btree (token);


--
-- Name: idx_user_push_tokens_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_user_push_tokens_user_id ON public.user_push_tokens USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_users_email ON public.users USING btree (lower(email));


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_vet_appointments_clinic_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_appointments_clinic_id ON public.vet_appointments USING btree (clinic_id);


--
-- Name: idx_vet_appointments_date; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_appointments_date ON public.vet_appointments USING btree (appointment_date);


--
-- Name: idx_vet_appointments_pet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_appointments_pet_id ON public.vet_appointments USING btree (pet_id);


--
-- Name: idx_vet_appointments_service_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_appointments_service_id ON public.vet_appointments USING btree (service_id);


--
-- Name: idx_vet_appointments_status; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_appointments_status ON public.vet_appointments USING btree (status);


--
-- Name: idx_vet_appointments_user_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_appointments_user_id ON public.vet_appointments USING btree (user_id);


--
-- Name: idx_vet_appointments_vet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_appointments_vet_id ON public.vet_appointments USING btree (veterinarian_id);


--
-- Name: idx_vet_clinic_mappings_clinic_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_clinic_mappings_clinic_id ON public.vet_clinic_mappings USING btree (clinic_id);


--
-- Name: idx_vet_clinic_mappings_vet_clinic; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE UNIQUE INDEX idx_vet_clinic_mappings_vet_clinic ON public.vet_clinic_mappings USING btree (veterinarian_id, clinic_id);


--
-- Name: idx_vet_clinic_mappings_vet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_clinic_mappings_vet_id ON public.vet_clinic_mappings USING btree (veterinarian_id);


--
-- Name: idx_vet_clinics_branch_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_clinics_branch_id ON public.vet_clinics USING btree (branch_id);


--
-- Name: idx_vet_clinics_slug; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE UNIQUE INDEX idx_vet_clinics_slug ON public.vet_clinics USING btree (lower(slug));


--
-- Name: idx_vet_exceptions_date; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_exceptions_date ON public.vet_schedule_exceptions USING btree (exception_date);


--
-- Name: idx_vet_exceptions_vet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_exceptions_vet_id ON public.vet_schedule_exceptions USING btree (veterinarian_id);


--
-- Name: idx_vet_lab_tests_deleted_at; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_lab_tests_deleted_at ON public.vet_lab_tests USING btree (deleted_at);


--
-- Name: idx_vet_lab_tests_pet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_lab_tests_pet_id ON public.vet_lab_tests USING btree (pet_id);


--
-- Name: idx_vet_lab_tests_record_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_lab_tests_record_id ON public.vet_lab_tests USING btree (medical_record_id);


--
-- Name: idx_vet_lab_tests_status; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_lab_tests_status ON public.vet_lab_tests USING btree (status);


--
-- Name: idx_vet_medical_records_appointment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_medical_records_appointment_id ON public.vet_medical_records USING btree (appointment_id);


--
-- Name: idx_vet_medical_records_deleted_at; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_medical_records_deleted_at ON public.vet_medical_records USING btree (deleted_at);


--
-- Name: idx_vet_medical_records_pet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_medical_records_pet_id ON public.vet_medical_records USING btree (pet_id);


--
-- Name: idx_vet_medical_records_record_date; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_medical_records_record_date ON public.vet_medical_records USING btree (record_date);


--
-- Name: idx_vet_medical_records_vet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_medical_records_vet_id ON public.vet_medical_records USING btree (veterinarian_id);


--
-- Name: idx_vet_medications_prescription_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_medications_prescription_id ON public.vet_prescription_medications USING btree (prescription_id);


--
-- Name: idx_vet_payments_appointment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_payments_appointment_id ON public.vet_appointment_payments USING btree (appointment_id);


--
-- Name: idx_vet_payments_user_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_payments_user_id ON public.vet_appointment_payments USING btree (user_id);


--
-- Name: idx_vet_prescriptions_appointment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_prescriptions_appointment_id ON public.vet_prescriptions USING btree (appointment_id);


--
-- Name: idx_vet_prescriptions_deleted_at; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_prescriptions_deleted_at ON public.vet_prescriptions USING btree (deleted_at);


--
-- Name: idx_vet_prescriptions_pet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_prescriptions_pet_id ON public.vet_prescriptions USING btree (pet_id);


--
-- Name: idx_vet_prescriptions_record_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_prescriptions_record_id ON public.vet_prescriptions USING btree (medical_record_id);


--
-- Name: idx_vet_prescriptions_status; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_prescriptions_status ON public.vet_prescriptions USING btree (status);


--
-- Name: idx_vet_queue_appointment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_queue_appointment_id ON public.vet_appointment_queue USING btree (appointment_id);


--
-- Name: idx_vet_queue_clinic_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_queue_clinic_id ON public.vet_appointment_queue USING btree (clinic_id);


--
-- Name: idx_vet_reminders_appointment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_reminders_appointment_id ON public.vet_appointment_reminders USING btree (appointment_id);


--
-- Name: idx_vet_reschedules_appointment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_reschedules_appointment_id ON public.vet_appointment_reschedules USING btree (appointment_id);


--
-- Name: idx_vet_reviews_appointment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_reviews_appointment_id ON public.vet_reviews USING btree (appointment_id);


--
-- Name: idx_vet_reviews_user_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_reviews_user_id ON public.vet_reviews USING btree (user_id);


--
-- Name: idx_vet_reviews_vet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_reviews_vet_id ON public.vet_reviews USING btree (veterinarian_id);


--
-- Name: idx_vet_schedules_clinic_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_schedules_clinic_id ON public.vet_schedules USING btree (clinic_id);


--
-- Name: idx_vet_schedules_vet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_schedules_vet_id ON public.vet_schedules USING btree (veterinarian_id);


--
-- Name: idx_vet_services_code; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_services_code ON public.vet_services USING btree (lower(code));


--
-- Name: idx_vet_services_name; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_services_name ON public.vet_services USING btree (lower(name));


--
-- Name: idx_vet_vaccinations_appointment_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_vaccinations_appointment_id ON public.vet_vaccinations USING btree (appointment_id);


--
-- Name: idx_vet_vaccinations_deleted_at; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_vaccinations_deleted_at ON public.vet_vaccinations USING btree (deleted_at);


--
-- Name: idx_vet_vaccinations_medical_record_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_vaccinations_medical_record_id ON public.vet_vaccinations USING btree (medical_record_id);


--
-- Name: idx_vet_vaccinations_next_due_date; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_vaccinations_next_due_date ON public.vet_vaccinations USING btree (next_due_date);


--
-- Name: idx_vet_vaccinations_pet_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_vaccinations_pet_id ON public.vet_vaccinations USING btree (pet_id);


--
-- Name: idx_vet_vaccinations_vaccination_date; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_vet_vaccinations_vaccination_date ON public.vet_vaccinations USING btree (vaccination_date);


--
-- Name: idx_veterinarians_employee_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_veterinarians_employee_id ON public.veterinarians USING btree (employee_id);


--
-- Name: idx_veterinarians_license; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE UNIQUE INDEX idx_veterinarians_license ON public.veterinarians USING btree (lower(license_number));


--
-- Name: idx_veterinarians_user_id; Type: INDEX; Schema: public; Owner: dbadmin
--

CREATE INDEX idx_veterinarians_user_id ON public.veterinarians USING btree (user_id);


--
-- Name: breeds breeds_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER breeds_touch_updated_at BEFORE UPDATE ON public.breeds FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: in_app_notifications in_app_notifications_touch_updated_at; Type: TRIGGER; Schema: public; Owner: admin
--

CREATE TRIGGER in_app_notifications_touch_updated_at BEFORE UPDATE ON public.in_app_notifications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: permissions permissions_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER permissions_touch_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: pet_types pet_types_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER pet_types_touch_updated_at BEFORE UPDATE ON public.pet_types FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: pets pets_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER pets_touch_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: roles roles_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER roles_touch_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: users users_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER users_touch_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_appointment_payments vet_appointment_payments_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_appointment_payments_touch_updated_at BEFORE UPDATE ON public.vet_appointment_payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_appointment_queue vet_appointment_queue_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_appointment_queue_touch_updated_at BEFORE UPDATE ON public.vet_appointment_queue FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_appointment_reminders vet_appointment_reminders_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_appointment_reminders_touch_updated_at BEFORE UPDATE ON public.vet_appointment_reminders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_appointments vet_appointments_assign_number_trigger; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_appointments_assign_number_trigger BEFORE INSERT ON public.vet_appointments FOR EACH ROW EXECUTE FUNCTION public.vet_appointments_assign_number();


--
-- Name: vet_appointments vet_appointments_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_appointments_touch_updated_at BEFORE UPDATE ON public.vet_appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_clinic_mappings vet_clinic_mappings_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_clinic_mappings_touch_updated_at BEFORE UPDATE ON public.vet_clinic_mappings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_clinics vet_clinics_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_clinics_touch_updated_at BEFORE UPDATE ON public.vet_clinics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_lab_tests vet_lab_tests_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_lab_tests_touch_updated_at BEFORE UPDATE ON public.vet_lab_tests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_medical_records vet_medical_records_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_medical_records_touch_updated_at BEFORE UPDATE ON public.vet_medical_records FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_payment_transactions vet_payment_transactions_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_payment_transactions_touch_updated_at BEFORE UPDATE ON public.vet_payment_transactions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_prescription_medications vet_prescription_medications_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_prescription_medications_touch_updated_at BEFORE UPDATE ON public.vet_prescription_medications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_prescriptions vet_prescriptions_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_prescriptions_touch_updated_at BEFORE UPDATE ON public.vet_prescriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_reviews vet_reviews_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_reviews_touch_updated_at BEFORE UPDATE ON public.vet_reviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_schedules vet_schedules_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_schedules_touch_updated_at BEFORE UPDATE ON public.vet_schedules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_services vet_services_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_services_touch_updated_at BEFORE UPDATE ON public.vet_services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_vaccinations vet_vaccinations_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER vet_vaccinations_touch_updated_at BEFORE UPDATE ON public.vet_vaccinations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: veterinarians veterinarians_touch_updated_at; Type: TRIGGER; Schema: public; Owner: dbadmin
--

CREATE TRIGGER veterinarians_touch_updated_at BEFORE UPDATE ON public.veterinarians FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: breeds breeds_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: breeds breeds_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: breeds breeds_pet_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_pet_type_id_fkey FOREIGN KEY (pet_type_id) REFERENCES public.pet_types(id) ON DELETE CASCADE;


--
-- Name: breeds breeds_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: email_verifications email_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: veterinarians fk_veterinarians_user_id; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT fk_veterinarians_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: in_app_notifications in_app_notifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_logs notification_logs_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE SET NULL;


--
-- Name: notification_template_translations notification_template_translations_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_template_translations
    ADD CONSTRAINT notification_template_translations_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.notification_templates(id) ON DELETE CASCADE;


--
-- Name: notification_templates notification_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_templates notification_templates_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pet_types pet_types_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pet_types
    ADD CONSTRAINT pet_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: pet_types pet_types_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pet_types
    ADD CONSTRAINT pet_types_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: pet_types pet_types_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pet_types
    ADD CONSTRAINT pet_types_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: pets pets_breed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.breeds(id) ON DELETE SET NULL;


--
-- Name: pets pets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: pets pets_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: pets pets_pet_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_pet_type_id_fkey FOREIGN KEY (pet_type_id) REFERENCES public.pet_types(id) ON DELETE RESTRICT;


--
-- Name: pets pets_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: pets pets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: app_settings settings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT settings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: app_settings settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_addresses user_addresses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_addresses user_addresses_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_addresses user_addresses_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_notification_preferences user_notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.in_app_notifications(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_push_tokens user_push_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_push_tokens
    ADD CONSTRAINT user_push_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_payments vet_appointment_payments_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_payments vet_appointment_payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_appointment_payments vet_appointment_payments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_appointment_payments vet_appointment_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_queue vet_appointment_queue_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_queue
    ADD CONSTRAINT vet_appointment_queue_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_queue vet_appointment_queue_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_queue
    ADD CONSTRAINT vet_appointment_queue_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_reminders vet_appointment_reminders_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_reminders
    ADD CONSTRAINT vet_appointment_reminders_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_reschedules vet_appointment_reschedules_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointment_reschedules
    ADD CONSTRAINT vet_appointment_reschedules_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_appointments vet_appointments_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE CASCADE;


--
-- Name: vet_appointments vet_appointments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_appointments vet_appointments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: vet_appointments vet_appointments_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_appointments vet_appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.vet_services(id) ON DELETE SET NULL;


--
-- Name: vet_appointments vet_appointments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_appointments vet_appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vet_appointments vet_appointments_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_clinic_mappings vet_clinic_mappings_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_clinic_mappings
    ADD CONSTRAINT vet_clinic_mappings_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE CASCADE;


--
-- Name: vet_clinic_mappings vet_clinic_mappings_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_clinic_mappings
    ADD CONSTRAINT vet_clinic_mappings_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_clinics vet_clinics_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_clinics
    ADD CONSTRAINT vet_clinics_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_clinics vet_clinics_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_clinics
    ADD CONSTRAINT vet_clinics_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: vet_clinics vet_clinics_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_clinics
    ADD CONSTRAINT vet_clinics_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_lab_tests vet_lab_tests_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE SET NULL;


--
-- Name: vet_lab_tests vet_lab_tests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_lab_tests vet_lab_tests_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.vet_medical_records(id) ON DELETE CASCADE;


--
-- Name: vet_lab_tests vet_lab_tests_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_lab_tests vet_lab_tests_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_medical_records vet_medical_records_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_medical_records vet_medical_records_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_medical_records vet_medical_records_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_medical_records vet_medical_records_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_medical_records vet_medical_records_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE SET NULL;


--
-- Name: vet_payment_transactions vet_payment_transactions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_payment_transactions
    ADD CONSTRAINT vet_payment_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.vet_appointment_payments(id) ON DELETE CASCADE;


--
-- Name: vet_prescription_medications vet_prescription_medications_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescription_medications
    ADD CONSTRAINT vet_prescription_medications_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.vet_prescriptions(id) ON DELETE CASCADE;


--
-- Name: vet_prescriptions vet_prescriptions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE SET NULL;


--
-- Name: vet_prescriptions vet_prescriptions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_prescriptions vet_prescriptions_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.vet_medical_records(id) ON DELETE CASCADE;


--
-- Name: vet_prescriptions vet_prescriptions_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_prescriptions vet_prescriptions_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_prescriptions vet_prescriptions_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE SET NULL;


--
-- Name: vet_reviews vet_reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_reviews
    ADD CONSTRAINT vet_reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_reviews vet_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_reviews
    ADD CONSTRAINT vet_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vet_reviews vet_reviews_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_reviews
    ADD CONSTRAINT vet_reviews_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE SET NULL;


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_schedules vet_schedules_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE CASCADE;


--
-- Name: vet_schedules vet_schedules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_schedules vet_schedules_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_schedules vet_schedules_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_services vet_services_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_services
    ADD CONSTRAINT vet_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_services vet_services_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_services
    ADD CONSTRAINT vet_services_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_vaccinations vet_vaccinations_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE SET NULL;


--
-- Name: vet_vaccinations vet_vaccinations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_vaccinations vet_vaccinations_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.vet_medical_records(id) ON DELETE SET NULL;


--
-- Name: vet_vaccinations vet_vaccinations_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_vaccinations vet_vaccinations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_vaccinations vet_vaccinations_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE SET NULL;


--
-- Name: veterinarians veterinarians_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: veterinarians veterinarians_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: veterinarians veterinarians_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbadmin
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

