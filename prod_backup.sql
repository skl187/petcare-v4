--
-- PostgreSQL database dump
--

\restrict mMeTAERbVcY5ps8s1rtK1zH5kAoLWoe825Vv1eddez0JAP41lE8ygdVjfASlqjI

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: generate_appointment_number(uuid); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.generate_appointment_number(p_clinic_id uuid) OWNER TO postgres;

--
-- Name: get_notification_template(text, text); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.get_notification_template(p_key text, p_locale text) OWNER TO postgres;

--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.touch_updated_at() OWNER TO postgres;

--
-- Name: vet_appointments_assign_number(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.vet_appointments_assign_number() OWNER TO postgres;

--
-- Name: vet_recalc_appointment_totals(uuid); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.vet_recalc_appointment_totals(p_appointment_id uuid) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: breeds; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.breeds OWNER TO postgres;

--
-- Name: email_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_verifications (
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


ALTER TABLE public.email_verifications OWNER TO postgres;

--
-- Name: in_app_notifications; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.in_app_notifications OWNER TO postgres;

--
-- Name: notification_channels; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notification_channels OWNER TO postgres;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notification_logs OWNER TO postgres;

--
-- Name: notification_template_translations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notification_template_translations OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: pet_types; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.pet_types OWNER TO postgres;

--
-- Name: pets; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.pets OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.user_addresses OWNER TO postgres;

--
-- Name: user_notification_preferences; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.user_notification_preferences OWNER TO postgres;

--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.user_notifications OWNER TO postgres;

--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    user_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: user_push_tokens; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.user_push_tokens OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vet_appointment_payments; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_appointment_payments OWNER TO postgres;

--
-- Name: vet_appointment_queue; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_appointment_queue OWNER TO postgres;

--
-- Name: vet_appointment_reminders; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_appointment_reminders OWNER TO postgres;

--
-- Name: vet_appointment_reschedules; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_appointment_reschedules OWNER TO postgres;

--
-- Name: vet_appointment_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vet_appointment_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vet_appointment_seq OWNER TO postgres;

--
-- Name: vet_appointments; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_appointments OWNER TO postgres;

--
-- Name: vet_clinic_mappings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_clinic_mappings OWNER TO postgres;

--
-- Name: vet_clinics; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_clinics OWNER TO postgres;

--
-- Name: vet_lab_tests; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_lab_tests OWNER TO postgres;

--
-- Name: vet_medical_records; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_medical_records OWNER TO postgres;

--
-- Name: vet_payment_transactions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_payment_transactions OWNER TO postgres;

--
-- Name: vet_prescription_medications; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_prescription_medications OWNER TO postgres;

--
-- Name: vet_prescriptions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_prescriptions OWNER TO postgres;

--
-- Name: vet_reviews; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_reviews OWNER TO postgres;

--
-- Name: vet_schedule_exceptions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_schedule_exceptions OWNER TO postgres;

--
-- Name: vet_schedules; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_schedules OWNER TO postgres;

--
-- Name: vet_services; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_services OWNER TO postgres;

--
-- Name: vet_vaccinations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.vet_vaccinations OWNER TO postgres;

--
-- Name: veterinarians; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.veterinarians OWNER TO postgres;

--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (id, namespace, key, value, description, is_secret, is_active, created_by, updated_by, created_at, updated_at) FROM stdin;
526a6d62-1a17-4b55-aa7d-c79e7359e033	tenant_acme	smtp_config	{"host": "smtp.hostinger.com", "port": 465, "secure": true, "password": "C1:k>spP5k*", "username": "noreply@lhcits.com", "from_name": "bracepet", "from_email": "noreply@lhcits.com"}	SMTP configuration for email service	t	t	\N	\N	2026-02-17 16:18:22.066613+00	2026-02-17 16:18:22.066613+00
c063798b-8656-4a11-bd88-a2bdf235f7ad	notification_templates	test_template_1	{"is_active": true}	test template 1	f	t	0800678a-4d55-42bb-b75a-b21d91123c62	\N	2026-02-19 18:13:24.485678+00	2026-02-19 18:16:32.073416+00
67cc1dda-dcbe-4f8b-a6ef-b0681a98398c	global	smtp_config	{"host": "smtp.office365.com", "port": 465, "secure": true, "password": "acme-smtp-password-123", "username": "notifications@acme.com", "from_name": "Acme Corp", "from_email": "notifications@acme.com"}	SMTP configuration for email service	t	t	\N	\N	2026-02-15 10:28:47.394438+00	2026-02-19 15:30:36.364997+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, resource, changes, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: breeds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.breeds (id, name, slug, pet_type_id, description, status, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
986f6f27-0cce-4c5c-b051-c0f5465f2cda	Labrador	labrador	a6d8dc62-9af3-484a-a98b-caace713860b	NewPet	1	0800678a-4d55-42bb-b75a-b21d91123c62	\N	\N	2026-01-25 11:40:11.697514+00	2026-02-05 16:10:09.871369+00	\N
a94bb9d8-f108-4c43-9348-f9bcee7e3966	Persian	persian	857eb666-9376-429d-ad0b-25b3667e1633	Light weight cat	1	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-02-13 16:13:32.052991+00	2026-02-13 16:13:32.052991+00	\N
fdd1d4f8-45b4-4227-8378-d7c81d537374	macau	macau	a42ba02c-d4e5-4e25-a880-547c6f2a8f23	hello	1	0800678a-4d55-42bb-b75a-b21d91123c62	\N	\N	2026-01-25 11:34:14.951907+00	2026-02-17 16:19:12.89092+00	\N
3101397d-78c4-42c1-919a-c20e2828b36d	Golden Retriever	golden-retriever	a6d8dc62-9af3-484a-a98b-caace713860b	\N	1	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-02-24 22:08:28.378126+00	2026-02-24 22:08:28.378126+00	\N
8c0ab547-73ea-4040-ae1a-7ee4ae1a4955	Poodle	poodle	a6d8dc62-9af3-484a-a98b-caace713860b	Small size dog	1	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-02-24 22:08:56.651049+00	2026-02-24 22:08:56.651049+00	\N
8141e72e-dd53-44cc-821c-01162fb9d8e8	Burmese	burmese	857eb666-9376-429d-ad0b-25b3667e1633	Burmese have round heads and full faces that blend into their short muzzles.	1	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-02-24 22:11:14.92086+00	2026-02-24 22:11:14.92086+00	\N
44e8bb0d-f837-4e70-8ecb-9afc7c2ce541	Amazon Parrot	amazon-parrot	a42ba02c-d4e5-4e25-a880-547c6f2a8f23	\N	1	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-02-24 22:12:18.632152+00	2026-02-24 22:12:18.632152+00	\N
a1021d9b-4a27-481a-9928-76df792cd408	Cocktatiel	cocktatiel	a42ba02c-d4e5-4e25-a880-547c6f2a8f23	\N	1	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-02-24 22:12:36.855014+00	2026-02-24 22:12:36.855014+00	\N
\.


--
-- Data for Name: email_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_verifications (id, user_id, token, token_hash, expires_at, used, created_at, consumed_at, request_ip) FROM stdin;
4dab8354-4639-41ab-81d7-9bacc93f9d58	6521015d-6084-4f2e-bce5-f1c387cc8827	37e42b013a52d0731fb34134a294c8b8cfae12d3935f094f936cac17b2d063ad	26f012f2c0ff0b9e4eeb3d35338cb3e371982325abd517ab193e46be02a4e065	2026-02-11 14:37:54.999+00	f	2026-02-10 14:37:54.996102+00	\N	::ffff:172.18.0.1
5a5dbfb7-9de9-409f-873d-1a4a6081e4a4	2289e865-515e-4613-aadc-527c9fd314c2	197a0cb77a66142467271167dc5019c02066e6d1cbc720d13af6e1e677e8c077	29ec9634d8623a4ec7ed1560c2e85b11b2aacffa7d15024587b30800c0d77521	2026-02-14 16:57:17.795+00	f	2026-02-13 16:57:17.791266+00	\N	::ffff:172.18.0.1
\.


--
-- Data for Name: in_app_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.in_app_notifications (id, title, message, type, priority, target_type, target_role, action_url, icon, metadata, scheduled_at, expires_at, status, created_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: notification_channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_channels (id, slug, name, provider, config, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_logs (id, notification_id, channel, provider, provider_message_id, status, response, created_at) FROM stdin;
7bf7a54a-adfd-47a8-b847-61c7e14f4c8d	ff4348f5-6e79-4123-b28e-271190acdbf6	email	smtp	\N	failed	{"error": "connect ETIMEDOUT 2603:1046:c04:1412::2:465"}	2026-02-21 18:26:32.732725+00
\.


--
-- Data for Name: notification_template_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_template_translations (id, template_id, locale, subject, body, body_html, variables, is_default, created_at, updated_at) FROM stdin;
1d75f4d4-ff02-40d5-846d-658cd240d2a4	270062a9-8c1c-4a16-bfac-82737f6e6ed9	en	{{pet_name}} vaccination due	{{pet_name}} vaccination due	<h3> {{pet_name}} vaccination due</h3>	\N	t	2026-02-19 18:32:29.541781+00	2026-02-19 18:32:29.541781+00
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, template_key, name, channel, description, default_subject, default_body, default_body_html, variables, is_active, created_by, updated_by, created_at, updated_at) FROM stdin;
270062a9-8c1c-4a16-bfac-82737f6e6ed9	vaccination_due_email	Vaccination Due Email	email	vaccination alerts	{{pet_name}} vaccination due	{{pet_name}} vaccination due	<h3> {{pet_name}} vaccination due</h3>	\N	t	0800678a-4d55-42bb-b75a-b21d91123c62	\N	2026-02-19 18:32:29.527671+00	2026-02-19 18:35:43.768331+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, notification_key, channel, target, template_key, locale, payload, scheduled_at, sent_at, status, error, retry_count, created_at, updated_at) FROM stdin;
ff4348f5-6e79-4123-b28e-271190acdbf6	e2db943d-d5db-420b-905c-8ba12325b693	appointment_notification	email	{"email": "petowner@gmail.com"}	appointment_notification_builtin	en	{"status": "scheduled", "pet_name": "Dog", "vet_name": "Dr. Niveditha Gadde", "owner_name": "pet owner", "clinic_name": "pup care", "total_amount": "0.00", "chief_complaint": "", "appointment_date": "Tuesday, January 27, 2026", "appointment_time": "09:00:00", "appointment_type": "consultation", "appointment_number": "APPT-yashoda1-20260126-     1"}	2026-02-21 18:26:32.706484+00	\N	failed	connect ETIMEDOUT 2603:1046:c04:1412::2:465	0	2026-02-21 18:26:32.706484+00	2026-02-21 18:26:32.706484+00
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_resets (id, user_id, token, token_hash, expires_at, used, created_at, consumed_at, request_ip) FROM stdin;
18a87568-2631-4407-9afb-41c89d038350	e2db943d-d5db-420b-905c-8ba12325b693	37e2090b3da5e58bc8e33561cd547ad11a03ac0bba4e4a4604dbd703de276dfd	b67075de2bdec0d081efd544271362bc853c0fa45cdc3f8df9a9b78c34a56488	2026-01-24 16:42:13.297+00	t	2026-01-24 15:42:13.296958+00	2026-01-24 16:04:35.408791+00	::ffff:192.168.29.208
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, action, resource, description, created_at, updated_at, deleted_at) FROM stdin;
da0f50d5-64a0-4d3e-a676-b1b886e2d33b	Create User	create	user	Create new users	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
ff3de6b8-e1c2-4cf9-a9a9-00dcc7d1c436	Read User	read	user	View user details	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
99bf4e77-2fc8-4281-bf42-333a79ad71a7	Update User	update	user	Edit user information	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
a3fc0fc6-9405-487b-8bd4-992aac71037e	Delete User	delete	user	Delete user account	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
516a5e95-cc3e-4d43-aa80-6d6ce296c8c8	Manage Roles	manage	role	Assign/revoke roles	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
cb1821e7-5c8c-4f7b-9a6f-58e417d3730d	Manage Permissions	manage	permission	Assign/revoke permissions	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
cc4a44d2-0fe9-4b67-9d2f-bbe401b96e4e	Create Appointment	create	appointment	Book new appointments	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
5d0be663-9125-4a97-8d20-28df9758661f	Read Appointment	read	appointment	View appointment details	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
7e0cd64d-3811-4e99-9955-4a59f474bdbc	Update Appointment	update	appointment	Edit appointment details	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
22c08397-8a48-4822-8fe6-a8be16dbb7e9	Delete Appointment	delete	appointment	Cancel appointments	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
51373170-8706-4f6a-aa10-07985e5331c0	View All Appointments	read	appointment_all	View all appointments (not just own)	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
16078209-9f01-463a-aaac-1fd64e31fbb0	Create Pet	create	pet	Register new pets	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
de945139-fee3-4107-b82a-be270e17ab6d	Read Pet	read	pet	View pet details	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
b6084284-2774-485e-8940-fbd52ee165c4	Update Pet	update	pet	Edit pet information	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
5a63b6a1-c936-4769-980b-9d1cbec81c17	Delete Pet	delete	pet	Delete pet record	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
14dc9e31-cc56-4ff1-a620-3a8d898cd869	Create Pet Type	create	pet_type	Create pet type	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
867d934d-fc8e-4b5c-b2c8-dc869c231ef7	Read Pet Type	read	pet_type	View pet types	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
33edbbfe-895d-4cf2-8bc4-35ebd829d356	Update Pet Type	update	pet_type	Edit pet types	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
fbf34c3e-07d8-4fdc-95ea-f202d88ff346	Delete Pet Type	delete	pet_type	Delete pet types	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
175d2387-b104-48ad-80bb-d1c6769a586d	Create Breed	create	breed	Create breed	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
cfc281fb-67eb-4ea4-9a66-6c2717bcb9de	Read Breed	read	breed	View breeds	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
f1ae1452-9a4c-42e9-b55a-dedc32d25feb	Update Breed	update	breed	Edit breeds	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
9f452793-3f36-4b49-8a58-055783417b93	Delete Breed	delete	breed	Delete breeds	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
dbcb97cd-e678-4787-ae72-b0d0d0ff17e1	Create Appointment Slot	create	slot	Create appointment slots	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
8ff3fe55-60e0-401f-94ac-3f433c61b6dd	Read Appointment Slot	read	slot	View appointment slots	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
b36b320a-159c-4525-b6ec-d7644811a609	Update Appointment Slot	update	slot	Edit appointment slots	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
5ae2cddd-324a-4ce7-9c56-72f1028475f9	Delete Appointment Slot	delete	slot	Delete appointment slots	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
7e874ef3-c786-42ff-a52c-7d71a7d4488a	Create Invoice	create	invoice	Create invoices	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
45cc74f7-459c-44ad-9c75-013dde2ebc13	Read Invoice	read	invoice	View invoices	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
c648f19f-fa00-40d7-b119-0c952525f76d	Update Invoice	update	invoice	Edit invoices	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
6352a05b-8b23-4a9f-b40a-6d7bdd277da7	View Financial Reports	read	report_financial	View financial reports	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
f2fa875d-07c3-4558-8573-326ddc2efc77	View Audit Logs	read	audit_log	View system audit logs	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
9b98ec06-6d02-4db4-bde0-c3f973fe26aa	View System Reports	read	report_system	View system reports	2026-02-08 12:56:58.946383+00	2026-02-08 12:56:58.946383+00	\N
\.


--
-- Data for Name: pet_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pet_types (id, name, slug, status, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at, icon_url) FROM stdin;
857eb666-9376-429d-ad0b-25b3667e1633	Cat	cat	1	0800678a-4d55-42bb-b75a-b21d91123c62	\N	\N	2026-01-25 10:54:43.326669+00	2026-02-08 14:15:15.754554+00	\N	/icons/cat.png
a42ba02c-d4e5-4e25-a880-547c6f2a8f23	parrot	parrot	1	0800678a-4d55-42bb-b75a-b21d91123c62	\N	\N	2026-01-25 11:10:51.833477+00	2026-02-08 14:15:15.754554+00	\N	/icons/parrot.png
a6d8dc62-9af3-484a-a98b-caace713860b	Dog	dog	1	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-01-25 09:52:15.784465+00	2026-02-08 14:15:15.754554+00	\N	/icons/dog.png
f34eb1b6-46cd-4655-ad96-9244f18094c1	Rabbit	rabbit	1	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-02-24 22:16:38.66924+00	2026-02-24 22:16:38.66924+00	\N	\N
\.


--
-- Data for Name: pets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pets (id, name, slug, pet_type_id, breed_id, size, date_of_birth, age, gender, weight, height, weight_unit, height_unit, user_id, additional_info, status, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
8a69ef37-6457-4887-982f-1b2529ef81ad	Dog	dog	a6d8dc62-9af3-484a-a98b-caace713860b	986f6f27-0cce-4c5c-b051-c0f5465f2cda	large	2022-08-09 00:00:00+00	\N	male	20	20	kg	cm	e2db943d-d5db-420b-905c-8ba12325b693	{"notes": ""}	1	\N	\N	\N	2026-01-25 13:28:56.853535+00	2026-01-25 13:42:56.432885+00	2026-01-25 13:42:56.432885+00
8a9b5a1d-8365-4ce6-8199-a2374e11848e	Brownnie	brownnie	a6d8dc62-9af3-484a-a98b-caace713860b	986f6f27-0cce-4c5c-b051-c0f5465f2cda	Small	2023-02-01 00:00:00+00	\N	male	12	29.8	kg	inch	6521015d-6084-4f2e-bce5-f1c387cc8827	{"notes": ""}	1	\N	\N	\N	2026-02-10 21:27:16.296304+00	2026-02-10 21:27:16.296304+00	\N
cc02cf46-59f2-4dfa-af42-ab31722df1db	Rio	rio	a42ba02c-d4e5-4e25-a880-547c6f2a8f23	fdd1d4f8-45b4-4227-8378-d7c81d537374	small	2005-03-12 00:00:00+00	\N	female	3	11.7	kg	cm	e2db943d-d5db-420b-905c-8ba12325b693	{"notes": ""}	1	\N	\N	\N	2026-01-25 12:53:38.388719+00	2026-02-13 17:05:35.91112+00	\N
cee589eb-96f9-410b-a184-56a503844d39	Skye	skye	a6d8dc62-9af3-484a-a98b-caace713860b	986f6f27-0cce-4c5c-b051-c0f5465f2cda	medium	2020-01-01 00:00:00+00	\N	male	12.5	30	kg	cm	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	{"notes": ""}	1	\N	\N	\N	2026-01-25 11:51:27.890292+00	2026-02-13 17:06:25.169698+00	\N
0d6645cc-a789-4fed-939a-0a040b6bf02c	Juno	juno	a6d8dc62-9af3-484a-a98b-caace713860b	986f6f27-0cce-4c5c-b051-c0f5465f2cda	small	2024-01-01 00:00:00+00	\N	male	5	68	kg	cm	2289e865-515e-4613-aadc-527c9fd314c2	{"notes": ""}	1	\N	\N	\N	2026-02-13 17:07:59.496607+00	2026-02-13 17:07:59.496607+00	\N
3813b654-ca15-4249-b639-726e45c5c91c	Minnie	minnie	857eb666-9376-429d-ad0b-25b3667e1633	a94bb9d8-f108-4c43-9348-f9bcee7e3966	Small	2026-03-25 00:00:00+00	\N	female	5	30	kg	cm	6521015d-6084-4f2e-bce5-f1c387cc8827	{"notes": ""}	1	\N	\N	\N	2026-02-24 21:59:20.117322+00	2026-02-24 21:59:20.117322+00	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id, created_at) FROM stdin;
5c72a7b7-e70f-4814-a3b9-549c089a67f4	da0f50d5-64a0-4d3e-a676-b1b886e2d33b	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	ff3de6b8-e1c2-4cf9-a9a9-00dcc7d1c436	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	99bf4e77-2fc8-4281-bf42-333a79ad71a7	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	a3fc0fc6-9405-487b-8bd4-992aac71037e	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	516a5e95-cc3e-4d43-aa80-6d6ce296c8c8	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	cb1821e7-5c8c-4f7b-9a6f-58e417d3730d	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	cc4a44d2-0fe9-4b67-9d2f-bbe401b96e4e	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	5d0be663-9125-4a97-8d20-28df9758661f	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	7e0cd64d-3811-4e99-9955-4a59f474bdbc	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	22c08397-8a48-4822-8fe6-a8be16dbb7e9	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	51373170-8706-4f6a-aa10-07985e5331c0	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	16078209-9f01-463a-aaac-1fd64e31fbb0	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	de945139-fee3-4107-b82a-be270e17ab6d	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	b6084284-2774-485e-8940-fbd52ee165c4	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	5a63b6a1-c936-4769-980b-9d1cbec81c17	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	14dc9e31-cc56-4ff1-a620-3a8d898cd869	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	867d934d-fc8e-4b5c-b2c8-dc869c231ef7	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	33edbbfe-895d-4cf2-8bc4-35ebd829d356	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	fbf34c3e-07d8-4fdc-95ea-f202d88ff346	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	175d2387-b104-48ad-80bb-d1c6769a586d	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	cfc281fb-67eb-4ea4-9a66-6c2717bcb9de	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	f1ae1452-9a4c-42e9-b55a-dedc32d25feb	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	9f452793-3f36-4b49-8a58-055783417b93	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	dbcb97cd-e678-4787-ae72-b0d0d0ff17e1	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	8ff3fe55-60e0-401f-94ac-3f433c61b6dd	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	b36b320a-159c-4525-b6ec-d7644811a609	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	5ae2cddd-324a-4ce7-9c56-72f1028475f9	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	7e874ef3-c786-42ff-a52c-7d71a7d4488a	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	45cc74f7-459c-44ad-9c75-013dde2ebc13	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	c648f19f-fa00-40d7-b119-0c952525f76d	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	6352a05b-8b23-4a9f-b40a-6d7bdd277da7	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	f2fa875d-07c3-4558-8573-326ddc2efc77	2026-02-08 12:56:58.946383+00
5c72a7b7-e70f-4814-a3b9-549c089a67f4	9b98ec06-6d02-4db4-bde0-c3f973fe26aa	2026-02-08 12:56:58.946383+00
4c680bd4-8b4d-46ef-9500-812f2d4cbdec	5d0be663-9125-4a97-8d20-28df9758661f	2026-02-08 12:56:58.946383+00
4c680bd4-8b4d-46ef-9500-812f2d4cbdec	7e0cd64d-3811-4e99-9955-4a59f474bdbc	2026-02-08 12:56:58.946383+00
4c680bd4-8b4d-46ef-9500-812f2d4cbdec	51373170-8706-4f6a-aa10-07985e5331c0	2026-02-08 12:56:58.946383+00
4c680bd4-8b4d-46ef-9500-812f2d4cbdec	de945139-fee3-4107-b82a-be270e17ab6d	2026-02-08 12:56:58.946383+00
4c680bd4-8b4d-46ef-9500-812f2d4cbdec	b6084284-2774-485e-8940-fbd52ee165c4	2026-02-08 12:56:58.946383+00
4c680bd4-8b4d-46ef-9500-812f2d4cbdec	8ff3fe55-60e0-401f-94ac-3f433c61b6dd	2026-02-08 12:56:58.946383+00
2a2000c8-8b33-433b-8823-a7481061e080	cc4a44d2-0fe9-4b67-9d2f-bbe401b96e4e	2026-02-13 16:14:57.618822+00
2a2000c8-8b33-433b-8823-a7481061e080	5d0be663-9125-4a97-8d20-28df9758661f	2026-02-13 16:14:57.618822+00
2a2000c8-8b33-433b-8823-a7481061e080	7e0cd64d-3811-4e99-9955-4a59f474bdbc	2026-02-13 16:14:57.618822+00
2a2000c8-8b33-433b-8823-a7481061e080	16078209-9f01-463a-aaac-1fd64e31fbb0	2026-02-13 16:14:57.618822+00
2a2000c8-8b33-433b-8823-a7481061e080	de945139-fee3-4107-b82a-be270e17ab6d	2026-02-13 16:14:57.618822+00
2a2000c8-8b33-433b-8823-a7481061e080	b6084284-2774-485e-8940-fbd52ee165c4	2026-02-13 16:14:57.618822+00
2a2000c8-8b33-433b-8823-a7481061e080	22c08397-8a48-4822-8fe6-a8be16dbb7e9	2026-02-13 16:14:57.618822+00
728fbd29-1941-4c32-9380-3ac78feda4c8	cc4a44d2-0fe9-4b67-9d2f-bbe401b96e4e	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	22c08397-8a48-4822-8fe6-a8be16dbb7e9	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	5d0be663-9125-4a97-8d20-28df9758661f	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	7e0cd64d-3811-4e99-9955-4a59f474bdbc	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	51373170-8706-4f6a-aa10-07985e5331c0	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	f2fa875d-07c3-4558-8573-326ddc2efc77	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	175d2387-b104-48ad-80bb-d1c6769a586d	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	9f452793-3f36-4b49-8a58-055783417b93	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	cfc281fb-67eb-4ea4-9a66-6c2717bcb9de	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	f1ae1452-9a4c-42e9-b55a-dedc32d25feb	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	cb1821e7-5c8c-4f7b-9a6f-58e417d3730d	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	16078209-9f01-463a-aaac-1fd64e31fbb0	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	5a63b6a1-c936-4769-980b-9d1cbec81c17	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	de945139-fee3-4107-b82a-be270e17ab6d	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	b6084284-2774-485e-8940-fbd52ee165c4	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	14dc9e31-cc56-4ff1-a620-3a8d898cd869	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	fbf34c3e-07d8-4fdc-95ea-f202d88ff346	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	867d934d-fc8e-4b5c-b2c8-dc869c231ef7	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	33edbbfe-895d-4cf2-8bc4-35ebd829d356	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	9b98ec06-6d02-4db4-bde0-c3f973fe26aa	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	516a5e95-cc3e-4d43-aa80-6d6ce296c8c8	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	da0f50d5-64a0-4d3e-a676-b1b886e2d33b	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	a3fc0fc6-9405-487b-8bd4-992aac71037e	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	ff3de6b8-e1c2-4cf9-a9a9-00dcc7d1c436	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	99bf4e77-2fc8-4281-bf42-333a79ad71a7	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	7e874ef3-c786-42ff-a52c-7d71a7d4488a	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	45cc74f7-459c-44ad-9c75-013dde2ebc13	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	c648f19f-fa00-40d7-b119-0c952525f76d	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	6352a05b-8b23-4a9f-b40a-6d7bdd277da7	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	dbcb97cd-e678-4787-ae72-b0d0d0ff17e1	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	5ae2cddd-324a-4ce7-9c56-72f1028475f9	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	8ff3fe55-60e0-401f-94ac-3f433c61b6dd	2026-02-17 16:20:42.477764+00
728fbd29-1941-4c32-9380-3ac78feda4c8	b36b320a-159c-4525-b6ec-d7644811a609	2026-02-17 16:20:42.477764+00
e61d8844-05ff-4544-a7db-2991e96e82bf	5d0be663-9125-4a97-8d20-28df9758661f	2026-02-17 16:21:17.700212+00
e61d8844-05ff-4544-a7db-2991e96e82bf	51373170-8706-4f6a-aa10-07985e5331c0	2026-02-17 16:21:17.700212+00
e61d8844-05ff-4544-a7db-2991e96e82bf	7e874ef3-c786-42ff-a52c-7d71a7d4488a	2026-02-17 16:21:17.700212+00
e61d8844-05ff-4544-a7db-2991e96e82bf	45cc74f7-459c-44ad-9c75-013dde2ebc13	2026-02-17 16:21:17.700212+00
e61d8844-05ff-4544-a7db-2991e96e82bf	c648f19f-fa00-40d7-b119-0c952525f76d	2026-02-17 16:21:17.700212+00
e61d8844-05ff-4544-a7db-2991e96e82bf	6352a05b-8b23-4a9f-b40a-6d7bdd277da7	2026-02-17 16:21:17.700212+00
9340ff95-467d-43e0-af18-418d5d9458bd	7e0cd64d-3811-4e99-9955-4a59f474bdbc	2026-02-17 20:17:51.123963+00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, slug, description, created_at, updated_at, deleted_at) FROM stdin;
5c72a7b7-e70f-4814-a3b9-549c089a67f4	Super Admin	superadmin	Super administrator with complete system access	2026-01-24 14:32:54.188449+00	2026-01-24 14:32:54.188449+00	\N
4c680bd4-8b4d-46ef-9500-812f2d4cbdec	Clinic Staff	clinic_staff	Front desk and clinic operations	2026-01-24 14:32:54.188449+00	2026-01-24 14:32:54.188449+00	\N
2a2000c8-8b33-433b-8823-a7481061e080	Pet Owner	owner	Pet owner - can book and manage own appointments	2026-01-24 14:32:54.188449+00	2026-02-13 16:14:57.52532+00	\N
728fbd29-1941-4c32-9380-3ac78feda4c8	Admin	admin	Administrator with user and clinic management	2026-01-24 14:32:54.188449+00	2026-02-17 16:20:41.806162+00	\N
e61d8844-05ff-4544-a7db-2991e96e82bf	Finance Manager	finance	Manages billing and financial reports	2026-01-24 14:32:54.188449+00	2026-02-17 16:21:17.077082+00	\N
9340ff95-467d-43e0-af18-418d5d9458bd	Doctor	veterinarian	Veterinary doctor - can manage appointments and prescribe	2026-01-24 14:32:54.188449+00	2026-02-17 20:17:50.419617+00	\N
\.


--
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_addresses (id, user_id, type, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary, status, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
a0aa03d6-a997-419e-951a-e9165128cb82	0800678a-4d55-42bb-b75a-b21d91123c62	home	Home	Hno1	hno2	hyd	telangana	500079	India	\N	\N	t	1	\N	\N	\N	2026-02-08 11:58:03.886765+00	2026-02-08 11:58:03.886765+00	\N
dfd0b7ae-72a7-4cdd-9fcf-d6fc02e57315	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	home	Home	Phase-2		Hyderabad	Telangana	500083	India	\N	\N	t	1	\N	\N	\N	2026-02-17 20:03:57.103852+00	2026-02-17 20:03:57.103852+00	\N
\.


--
-- Data for Name: user_notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_notification_preferences (id, user_id, notification_key, channel, enabled, lead_time, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_notifications (id, notification_id, user_id, is_read, read_at, is_archived, created_at) FROM stdin;
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permissions (user_id, permission_id, granted, granted_at) FROM stdin;
\.


--
-- Data for Name: user_push_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_push_tokens (id, user_id, platform, token, metadata, is_active, last_used_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id, is_primary, assigned_at) FROM stdin;
ccf7ad25-bf06-4b29-91f9-54627fae6a4f	5c72a7b7-e70f-4814-a3b9-549c089a67f4	t	2026-01-24 14:32:54.204901+00
0800678a-4d55-42bb-b75a-b21d91123c62	5c72a7b7-e70f-4814-a3b9-549c089a67f4	t	2026-01-24 14:44:34.080767+00
e2db943d-d5db-420b-905c-8ba12325b693	2a2000c8-8b33-433b-8823-a7481061e080	t	2026-01-24 14:41:29.56239+00
9a32d3f7-9b81-4f87-ac4f-73f290cca54d	2a2000c8-8b33-433b-8823-a7481061e080	f	2026-01-26 12:11:42.008301+00
65140d45-08c4-4447-90b6-a0b17f633ff5	2a2000c8-8b33-433b-8823-a7481061e080	f	2026-01-26 12:12:05.859285+00
ab553ba0-1a60-4ca6-95ff-a5f22d0dc9e2	2a2000c8-8b33-433b-8823-a7481061e080	f	2026-01-26 12:12:17.351825+00
1cc80ce1-e892-450e-bdb7-14e7486ace4f	2a2000c8-8b33-433b-8823-a7481061e080	f	2026-01-26 12:15:31.68073+00
517a4c9c-4c0b-46ce-8dbd-af8cfa90611a	2a2000c8-8b33-433b-8823-a7481061e080	f	2026-01-26 12:15:47.890877+00
1e6b7678-2793-4e6d-8d2a-aa36a23a07df	9340ff95-467d-43e0-af18-418d5d9458bd	f	2026-01-27 07:17:17.255409+00
37014c05-8e2a-4723-ab2c-be56bc7d55eb	2a2000c8-8b33-433b-8823-a7481061e080	f	2026-02-03 16:38:11.365382+00
6521015d-6084-4f2e-bce5-f1c387cc8827	2a2000c8-8b33-433b-8823-a7481061e080	f	2026-02-10 14:37:54.996102+00
2289e865-515e-4613-aadc-527c9fd314c2	2a2000c8-8b33-433b-8823-a7481061e080	f	2026-02-13 16:57:17.791266+00
e616b011-dbae-491c-9142-a25f2e2d07bd	9340ff95-467d-43e0-af18-418d5d9458bd	f	2026-02-24 22:14:24.41382+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, phone, password_hash, first_name, last_name, display_name, avatar_url, bio, is_email_verified, status, last_login_at, created_at, updated_at, deleted_at) FROM stdin;
085a200d-4046-4457-a758-c5d0b682ff32	jane.roe@example.com	\N	\N	Jane	Roe	Jane Roe	\N	\N	f	active	\N	2026-01-26 12:18:25.988842+00	2026-01-27 06:40:28.438134+00	\N
37014c05-8e2a-4723-ab2c-be56bc7d55eb	owner1@test.com	\N	$2b$10$SiNP0ICrYnKEHY4AaB08I.eGT4jFIzL7YCjhec75SCEEJjib/nXnW	John	Doe	John Doe	\N	\N	f	pending	\N	2026-02-03 16:38:11.365382+00	2026-02-03 16:38:11.365382+00	\N
9a32d3f7-9b81-4f87-ac4f-73f290cca54d	test+vetcreate_20260126@example.com	\N	$2b$10$VFpn6hxWjtrOlV9/XP2O1OGIVvu94uWGXAYpSRKko.F38dkrV/Yq2	Test	Vet	Test Vet	\N	\N	f	pending	\N	2026-01-26 12:11:42.008301+00	2026-01-26 12:11:42.008301+00	\N
65140d45-08c4-4447-90b6-a0b17f633ff5	test+vetcreate_20260126b@example.com	\N	$2b$10$jfSRM/yMWoM6SpgE.zDOgOnjb/jRHEkzS.sCsjIqP4nfUVghxi9Vy	Test	Vet	Test Vet	\N	\N	f	pending	\N	2026-01-26 12:12:05.859285+00	2026-01-26 12:12:05.859285+00	\N
1cc80ce1-e892-450e-bdb7-14e7486ace4f	test+svc_lookup_20260126@example.com	\N	$2b$10$k.FUjFCu93ZzIQO/Pim1j.F7HeTFa8.CCUXCybqrE2VDffJ3j5qUK	Svc	Maker	Svc Maker	\N	\N	f	pending	\N	2026-01-26 12:15:31.68073+00	2026-01-26 12:15:31.68073+00	\N
517a4c9c-4c0b-46ce-8dbd-af8cfa90611a	test+svc_lookup_20260126b@example.com	\N	$2b$10$bvNVsjZGRC5nvv8wAnDZK.yB/sddjL8nIZywNDeTjKboOQDH4W0F2	Svc	Maker	Svc Maker	\N	\N	f	pending	\N	2026-01-26 12:15:47.890877+00	2026-01-26 12:15:47.890877+00	\N
e2db943d-d5db-420b-905c-8ba12325b693	admin@gmail.com	\N	$2b$10$rClO/XYkYs4GcOkQZniLeePaPK8VkPWEsCUIbeSoZpKnT7gPQ4HmO	pet	owner	pet owner	\N	\N	t	active	2026-02-13 16:03:05.336891+00	2026-01-24 14:41:29.56239+00	2026-02-13 16:03:05.336891+00	\N
ab553ba0-1a60-4ca6-95ff-a5f22d0dc9e2	test+vetcreate_20260126c@example.com	\N	$2b$10$rClO/XYkYs4GcOkQZniLeePaPK8VkPWEsCUIbeSoZpKnT7gPQ4HmO	Test	Vet	Test Vet	\N	\N	f	pending	\N	2026-01-26 12:12:17.351825+00	2026-02-13 16:07:49.74422+00	\N
2289e865-515e-4613-aadc-527c9fd314c2	petowner1@petcare.app	\N	$2b$10$WycPux1qpmPW/v9V2d4.fuTyHV5yCfqVN4TpKKrD8X7uDUlTnDg/6	pet	owner1	pet owner1	\N	\N	t	active	2026-02-17 13:30:17.111747+00	2026-02-13 16:57:17.791266+00	2026-02-17 13:30:17.111747+00	\N
0800678a-4d55-42bb-b75a-b21d91123c62	gadde@gmail.com	5678987654	$2b$10$twruyRVExx0jG4yz1LQH2uPcDvQ3pkiSXoPdPXgWU4NvVnhYpwfXq	Niveditha	Gadde	Niveditha Gadde	\N	Manager	t	active	2026-03-03 08:27:52.625214+00	2026-01-24 14:23:33.373875+00	2026-03-03 08:27:52.625214+00	\N
1e6b7678-2793-4e6d-8d2a-aa36a23a07df	testvet@gmail.com	\N	$2b$10$rClO/XYkYs4GcOkQZniLeePaPK8VkPWEsCUIbeSoZpKnT7gPQ4HmO	test	vet	test vet	\N	\N	t	active	2026-03-03 08:30:36.65499+00	2026-01-27 07:17:17.255409+00	2026-03-03 08:30:36.65499+00	\N
6521015d-6084-4f2e-bce5-f1c387cc8827	namratharscs@gmail.com	\N	$2b$10$YikLkElc/CaQvZ03rQr3Qe5tF42QH0IpVb9zgoxePyqTnBQWMDAku	Namratha	Rajashekar	Namratha Rajashekar	\N	\N	t	active	2026-02-24 21:50:15.121839+00	2026-02-10 14:37:54.996102+00	2026-02-24 21:50:15.121839+00	\N
ccf7ad25-bf06-4b29-91f9-54627fae6a4f	admin@petcare.com	+1234567890	$2b$10$rClO/XYkYs4GcOkQZniLeePaPK8VkPWEsCUIbeSoZpKnT7gPQ4HmO	Admin	User	Admin	\N	\N	t	active	2026-02-24 22:06:14.465425+00	2026-01-24 14:32:54.195742+00	2026-02-24 22:06:14.465425+00	\N
e616b011-dbae-491c-9142-a25f2e2d07bd	arunkumar@gmail.com	\N	$2b$10$OVM4W9fSyVEHA1kLTOU73.EhjUMGYkAUs4LB.5XAY2FguRxRuPQoC	Arun 	Kumar	Arun  Kumar	\N	\N	f	active	\N	2026-02-24 22:14:24.41382+00	2026-02-24 22:14:24.41382+00	\N
\.


--
-- Data for Name: vet_appointment_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_appointment_payments (id, appointment_id, user_id, payment_method, transaction_id, consultation_fee, other_charges, subtotal, discount_amount, tax_amount, total_amount, paid_amount, payment_status, payment_date, created_by, updated_by, created_at, updated_at) FROM stdin;
6ffaeb6a-db5a-47fb-9fbd-54637e8cb1a1	fdd4c07b-2f6b-40f9-a763-5d1499ea9443	e2db943d-d5db-420b-905c-8ba12325b693	cash	\N	0.00	0.00	89.63	0.00	0.00	89.63	89.63	pending	\N	\N	\N	2026-01-26 15:15:04.932096+00	2026-01-26 15:15:04.932096+00
530fe43a-2bd7-49e0-a229-6ba1a49a9ad5	819cba56-30b4-4fbf-b51d-320ad9cabb24	e2db943d-d5db-420b-905c-8ba12325b693	cash	\N	0.00	0.00	99.80	0.00	0.00	99.80	99.80	pending	\N	\N	\N	2026-01-27 08:51:42.476563+00	2026-01-27 08:51:42.476563+00
324b9d8d-ae0b-4c25-8245-5ce5f0efb6b5	42f48f3c-3a8a-4773-ab6d-78747726e95e	2289e865-515e-4613-aadc-527c9fd314c2	cash	\N	0.00	0.00	49.80	0.00	0.00	49.80	49.80	pending	\N	\N	\N	2026-02-17 13:31:46.995787+00	2026-02-17 13:31:46.995787+00
d725dd4a-8f63-44ac-8152-8ad44f7566d1	cea00f8c-57d5-4261-ac50-c956eb475d5a	6521015d-6084-4f2e-bce5-f1c387cc8827	cash	\N	0.00	0.00	89.63	0.00	0.00	89.63	89.63	pending	\N	\N	\N	2026-02-24 21:56:23.636635+00	2026-02-24 21:56:23.636635+00
72011f06-9f35-4ce4-a9fb-e28dd7bf3dc7	10e60b3f-2aa1-485c-bf32-c0952c8deb17	6521015d-6084-4f2e-bce5-f1c387cc8827	cash	\N	0.00	0.00	50.00	0.00	0.00	50.00	50.00	pending	\N	\N	\N	2026-02-24 22:01:06.811073+00	2026-02-24 22:01:06.811073+00
6e52a88e-2761-426a-aba7-4a18e1314fe7	9480597c-81da-49df-a115-a53a027e2903	6521015d-6084-4f2e-bce5-f1c387cc8827	cash	\N	0.00	0.00	75.00	0.00	0.00	75.00	75.00	pending	\N	\N	\N	2026-02-24 22:03:09.796249+00	2026-02-24 22:03:09.796249+00
\.


--
-- Data for Name: vet_appointment_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_appointment_queue (id, appointment_id, clinic_id, queue_number, priority, checked_in_at, called_at, started_at, completed_at, estimated_wait_time, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vet_appointment_reminders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_appointment_reminders (id, appointment_id, reminder_type, scheduled_time, sent_at, status, error_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vet_appointment_reschedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_appointment_reschedules (id, appointment_id, old_date, old_time, new_date, new_time, reason, rescheduled_by, rescheduled_by_id, created_at) FROM stdin;
\.


--
-- Data for Name: vet_appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_appointments (id, appointment_number, user_id, pet_id, veterinarian_id, clinic_id, appointment_date, appointment_time, duration_minutes, appointment_type, status, priority, chief_complaint, symptoms, notes, consultation_fee, additional_charges, total_amount, payment_status, reminder_sent, reminder_sent_at, checked_in_at, checked_out_at, cancelled_at, cancellation_reason, cancelled_by, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at, service_id, service_fee, vet_service_ids) FROM stdin;
ea4d6234-af49-46b4-b155-147f881ed2ec	APPT-yashoda1-20260126-     1	e2db943d-d5db-420b-905c-8ba12325b693	8a69ef37-6457-4887-982f-1b2529ef81ad	8811e8dd-88f1-4c61-8720-61aaf3c16e1b	d464928f-2a77-4409-bc7f-0d41dd1615c1	2026-01-27	09:00:00	30	consultation	scheduled	normal	\N	\N	\N	0.00	0.00	0.00	pending	f	\N	\N	\N	\N	\N	\N	e2db943d-d5db-420b-905c-8ba12325b693	\N	\N	2026-01-26 13:44:16.335014+00	2026-01-26 13:44:16.335014+00	\N	\N	0.00	["c91e73ad-1641-4666-bc03-a4a6ea281204", "1b56d34a-7cbf-4fc1-9090-1cadbfe539c9"]
fdd4c07b-2f6b-40f9-a763-5d1499ea9443	APPT-yashoda-20260126-     2	e2db943d-d5db-420b-905c-8ba12325b693	cee589eb-96f9-410b-a184-56a503844d39	8811e8dd-88f1-4c61-8720-61aaf3c16e1b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	2025-01-30	05:00:00	30	checkup	scheduled	normal	checkup	["fever"]		0.00	0.00	89.63	pending	f	\N	\N	\N	\N	\N	\N	e2db943d-d5db-420b-905c-8ba12325b693	\N	\N	2026-01-26 15:15:04.932096+00	2026-01-26 15:15:04.932096+00	\N	\N	89.63	[{"quantity": 1, "unit_fee": 49.8, "service_id": "1b56d34a-7cbf-4fc1-9090-1cadbfe539c9"}, {"quantity": 1, "unit_fee": 39.83, "service_id": "0cfaf180-345f-4639-9ba1-f2bae9333e1a"}]
819cba56-30b4-4fbf-b51d-320ad9cabb24	APPT-yashoda-20260127-     3	e2db943d-d5db-420b-905c-8ba12325b693	cc02cf46-59f2-4dfa-af42-ab31722df1db	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	2026-02-02	03:00:00	30	checkup	completed	normal	checkup	["normal"]		0.00	0.00	99.80	pending	f	\N	2026-02-01 14:44:23.751585+00	2026-02-06 03:12:48.533594+00	\N	\N	\N	e2db943d-d5db-420b-905c-8ba12325b693	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	\N	2026-01-27 08:51:42.476563+00	2026-02-06 03:12:48.533594+00	\N	\N	99.80	[{"quantity": 1, "unit_fee": 50, "service_id": "c91e73ad-1641-4666-bc03-a4a6ea281204"}, {"quantity": 1, "unit_fee": 49.8, "service_id": "1b56d34a-7cbf-4fc1-9090-1cadbfe539c9"}]
42f48f3c-3a8a-4773-ab6d-78747726e95e	APPT-yashoda-20260217-000024	2289e865-515e-4613-aadc-527c9fd314c2	0d6645cc-a789-4fed-939a-0a040b6bf02c	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	2026-02-18	12:00:00	30	consultation	scheduled	normal	routine	[]		0.00	0.00	49.80	pending	f	\N	\N	\N	\N	\N	\N	2289e865-515e-4613-aadc-527c9fd314c2	\N	\N	2026-02-17 13:31:46.995787+00	2026-02-17 13:31:46.995787+00	\N	\N	49.80	[{"quantity": 1, "unit_fee": 49.8, "service_id": "1b56d34a-7cbf-4fc1-9090-1cadbfe539c9"}]
cea00f8c-57d5-4261-ac50-c956eb475d5a	APPT-yashoda-20260224-000025	6521015d-6084-4f2e-bce5-f1c387cc8827	8a9b5a1d-8365-4ce6-8199-a2374e11848e	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	2026-02-11	12:30:00	30	checkup	scheduled	normal	Vaccination only	[]		0.00	0.00	89.63	pending	f	\N	\N	\N	\N	\N	\N	6521015d-6084-4f2e-bce5-f1c387cc8827	\N	\N	2026-02-24 21:56:23.636635+00	2026-02-24 21:56:23.636635+00	\N	\N	89.63	[{"quantity": 1, "unit_fee": 49.8, "service_id": "1b56d34a-7cbf-4fc1-9090-1cadbfe539c9"}, {"quantity": 1, "unit_fee": 39.83, "service_id": "0cfaf180-345f-4639-9ba1-f2bae9333e1a"}]
10e60b3f-2aa1-485c-bf32-c0952c8deb17	APPT-yashoda-20260224-000026	6521015d-6084-4f2e-bce5-f1c387cc8827	3813b654-ca15-4249-b639-726e45c5c91c	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	2026-02-27	10:30:00	30	surgery	scheduled	normal	Ate a stone	[]		0.00	0.00	50.00	pending	f	\N	\N	\N	\N	\N	\N	6521015d-6084-4f2e-bce5-f1c387cc8827	\N	\N	2026-02-24 22:01:06.811073+00	2026-02-24 22:01:06.811073+00	\N	\N	50.00	[{"quantity": 1, "unit_fee": 50, "service_id": "d4d0f76b-9705-4683-8d36-05cd785e2242"}]
9480597c-81da-49df-a115-a53a027e2903	APPT-yashoda-20260224-000027	6521015d-6084-4f2e-bce5-f1c387cc8827	8a9b5a1d-8365-4ce6-8199-a2374e11848e	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	2026-02-26	16:30:00	30	checkup	scheduled	normal	Vaccination only	[]		0.00	0.00	75.00	pending	f	\N	\N	\N	\N	\N	\N	6521015d-6084-4f2e-bce5-f1c387cc8827	\N	\N	2026-02-24 22:03:09.796249+00	2026-02-24 22:03:09.796249+00	\N	\N	75.00	[{"quantity": 1, "unit_fee": 75, "service_id": "8bd376ae-f3c4-46c0-a392-805beefaaecc"}]
\.


--
-- Data for Name: vet_clinic_mappings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_clinic_mappings (id, veterinarian_id, clinic_id, is_primary, consultation_fee_override, created_at, updated_at, deleted_at, service_ids) FROM stdin;
9d4d1f40-30dc-463b-8ef4-811a475afab3	84c6da17-2159-42b2-bf03-26d4161716b4	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	t	\N	2026-01-26 12:18:25.988842+00	2026-01-26 12:18:25.988842+00	\N	["8bd376ae-f3c4-46c0-a392-805beefaaecc"]
28fd5ac8-1d59-4bc0-9ffe-f022830c19c7	8811e8dd-88f1-4c61-8720-61aaf3c16e1b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	t	\N	2026-01-26 12:42:27.181459+00	2026-01-26 12:42:27.181459+00	\N	["8bd376ae-f3c4-46c0-a392-805beefaaecc", "1b56d34a-7cbf-4fc1-9090-1cadbfe539c9"]
f9b77544-5b47-44df-89a2-138cbd466611	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	t	\N	2026-01-27 07:17:17.255409+00	2026-01-27 07:17:17.255409+00	\N	["1b56d34a-7cbf-4fc1-9090-1cadbfe539c9"]
1f11ce57-95f2-46ba-8a89-85607c626aea	274bb541-09f1-44d7-bcc0-d16242fc6cf1	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	t	\N	2026-02-24 22:14:24.41382+00	2026-02-24 22:14:24.41382+00	\N	["0cfaf180-345f-4639-9ba1-f2bae9333e1a", "1b56d34a-7cbf-4fc1-9090-1cadbfe539c9", "c91e73ad-1641-4666-bc03-a4a6ea281204", "d4d0f76b-9705-4683-8d36-05cd785e2242"]
\.


--
-- Data for Name: vet_clinics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_clinics (id, name, slug, license_number, description, specializations, branch_id, contact_email, contact_number, emergency_number, status, is_emergency_available, is_24x7, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at) FROM stdin;
d464928f-2a77-4409-bc7f-0d41dd1615c1	Yashoda1	yashoda1	\N	\N	\N	\N	test@email.com	562672882929	\N	1	f	f	0800678a-4d55-42bb-b75a-b21d91123c62	\N	\N	2026-01-25 14:38:20.041039+00	2026-01-25 14:38:50.38762+00	2026-01-25 14:38:50.38762+00
5444d315-73e2-4d85-8f92-1b4e4fbd0e52	Yashoda	yashoda	\N	\N	\N	\N	test@email.com	2728298220220202	\N	1	f	f	0800678a-4d55-42bb-b75a-b21d91123c62	\N	\N	2026-01-25 14:47:48.164792+00	2026-02-17 21:29:38.799913+00	\N
\.


--
-- Data for Name: vet_lab_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_lab_tests (id, medical_record_id, appointment_id, pet_id, test_name, test_type, ordered_date, sample_collected_date, result_date, status, results, normal_range, interpretation, lab_name, urgency, cost, created_by, updated_by, created_at, updated_at, deleted_at) FROM stdin;
a271182d-6741-4eb1-9f7b-8742db590c45	c7fae492-18ea-4fc8-a7e1-4451ad55d675	819cba56-30b4-4fbf-b51d-320ad9cabb24	cc02cf46-59f2-4dfa-af42-ab31722df1db	LFT	Chemistry	2026-02-03	\N	\N	ordered	\N	\N	\N	hysu	routine	29.99	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	\N	2026-02-03 11:00:26.683522+00	2026-02-03 11:00:26.683522+00	\N
fc9e5516-e929-41a3-8bb9-75a1abe9cdd4	c7fae492-18ea-4fc8-a7e1-4451ad55d675	819cba56-30b4-4fbf-b51d-320ad9cabb24	cc02cf46-59f2-4dfa-af42-ab31722df1db	CBP	Chemistry	2026-02-03	\N	\N	ordered	\N		\N	Lab	routine	50.00	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-02-03 11:00:26.670439+00	2026-02-03 12:26:18.920233+00	\N
\.


--
-- Data for Name: vet_medical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_medical_records (id, appointment_id, pet_id, veterinarian_id, record_date, record_type, diagnosis, symptoms, vital_signs, physical_examination, treatment_plan, recommendations, followup_required, followup_date, notes, is_confidential, created_by, updated_by, created_at, updated_at, deleted_at) FROM stdin;
2e502c41-6338-434d-bd2e-4e6ac79a1f5f	ea4d6234-af49-46b4-b155-147f881ed2ec	cee589eb-96f9-410b-a184-56a503844d39	8811e8dd-88f1-4c61-8720-61aaf3c16e1b	2026-01-31 15:55:01.503324+00	checkup	Healthy and fit	{"observations": ["Normal activity", "Good appetite"], "chief_complaint": "Regular checkup"}	{"heart_rate": 85, "temperature": 38.5, "respiratory_rate": 20}	All systems normal	Continue current diet and exercise	Schedule follow-up in 6 months	t	2026-07-31	Pet is doing great	f	085a200d-4046-4457-a758-c5d0b682ff32	\N	2026-01-31 15:55:01.503324+00	2026-01-31 15:55:01.503324+00	\N
c7fae492-18ea-4fc8-a7e1-4451ad55d675	819cba56-30b4-4fbf-b51d-320ad9cabb24	cc02cf46-59f2-4dfa-af42-ab31722df1db	9478b7a6-2231-4657-8e14-d08284cb368b	2026-02-01 15:18:32.728701+00	consultation	fever	{"fever": "high"}	{"weight": "6", "heartRate": "90", "temperature": "101", "respiratoryRate": "28"}	hcvhsgdcvhjs	djbchjdsc	dcgysjdcgs	t	2026-02-06	\N	f	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	\N	2026-02-01 15:18:32.728701+00	2026-02-01 15:18:32.728701+00	\N
\.


--
-- Data for Name: vet_payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_payment_transactions (id, payment_id, transaction_type, payment_method, transaction_id, amount, status, transaction_date, gateway_response, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vet_prescription_medications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_prescription_medications (id, prescription_id, medication_name, dosage, frequency, duration, route, instructions, quantity, refills_allowed, created_at, updated_at) FROM stdin;
7d97f46a-0b26-4b25-bbd0-d32acd5c84bf	f0382fbe-47c8-40e9-a839-65a1a3d1aa61	nhy	250mg	twice	5 days	oral	\N	15	0	2026-02-03 09:22:07.6666+00	2026-02-03 09:22:07.6666+00
d77f9e01-7f38-4755-a930-a2b8c5d97496	a177d606-8944-4e83-9f12-373d9821f9af	nhy	250mg	twice	5 days	oral	\N	15	0	2026-02-03 11:20:13.259022+00	2026-02-03 11:20:13.259022+00
8c9f9f1c-7d0f-42c3-9763-7b79b6050b66	a177d606-8944-4e83-9f12-373d9821f9af	tres	32	twice	4	oral	\N	\N	0	2026-02-03 11:20:13.259022+00	2026-02-03 11:20:13.259022+00
4ad31387-8ff3-483b-aa57-3016eda3c660	f0382fbe-47c8-40e9-a839-65a1a3d1aa61	nhy	250mg	twice	5 days	oral	\N	15	0	2026-02-03 11:39:26.100898+00	2026-02-03 11:39:26.100898+00
\.


--
-- Data for Name: vet_prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_prescriptions (id, medical_record_id, appointment_id, pet_id, veterinarian_id, prescription_number, prescription_date, valid_until, notes, status, created_by, updated_by, created_at, updated_at, deleted_at) FROM stdin;
f0382fbe-47c8-40e9-a839-65a1a3d1aa61	c7fae492-18ea-4fc8-a7e1-4451ad55d675	819cba56-30b4-4fbf-b51d-320ad9cabb24	cc02cf46-59f2-4dfa-af42-ab31722df1db	9478b7a6-2231-4657-8e14-d08284cb368b	RX-1770110527678-1	2026-02-03	2026-02-12	\N	active	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	\N	2026-02-03 09:22:07.6666+00	2026-02-03 09:22:07.6666+00	\N
a177d606-8944-4e83-9f12-373d9821f9af	c7fae492-18ea-4fc8-a7e1-4451ad55d675	819cba56-30b4-4fbf-b51d-320ad9cabb24	cc02cf46-59f2-4dfa-af42-ab31722df1db	9478b7a6-2231-4657-8e14-d08284cb368b	RX-1770117613261-2	2026-02-03	2026-02-11	\N	active	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	\N	2026-02-03 11:20:13.259022+00	2026-02-03 11:20:13.259022+00	\N
\.


--
-- Data for Name: vet_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_reviews (id, appointment_id, veterinarian_id, user_id, rating, review_text, professionalism_rating, knowledge_rating, communication_rating, facility_rating, is_anonymous, is_verified, status, created_at, updated_at, deleted_at) FROM stdin;
8fd8302b-e0ab-48ee-9df5-b4e5e3fd0573	819cba56-30b4-4fbf-b51d-320ad9cabb24	9478b7a6-2231-4657-8e14-d08284cb368b	e2db943d-d5db-420b-905c-8ba12325b693	5.0	Good	\N	\N	\N	\N	f	t	approved	2026-02-08 13:44:36.353744+00	2026-02-08 13:44:36.353744+00	\N
\.


--
-- Data for Name: vet_schedule_exceptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_schedule_exceptions (id, veterinarian_id, clinic_id, exception_date, exception_type, start_time, end_time, reason, is_recurring, created_by, updated_by, created_at, updated_at) FROM stdin;
773ff013-0f64-4cf2-99b3-f0a8357f5867	9478b7a6-2231-4657-8e14-d08284cb368b	\N	2026-03-04	holiday	00:00:00	23:59:00	Holi	f	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-03-03 08:32:12.722027+00	2026-03-03 08:32:12.722027+00
\.


--
-- Data for Name: vet_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_schedules (id, veterinarian_id, clinic_id, day_of_week, start_time, end_time, slot_duration, max_appointments_per_slot, is_available, created_by, updated_by, created_at, updated_at, deleted_at) FROM stdin;
ee6e11a7-0113-4b17-aea0-58158f9f9e53	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	0	09:00:00	17:00:00	30	1	f	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-03-03 08:31:18.448795+00	2026-03-03 08:31:18.448795+00	\N
7b812b85-33df-4192-9747-0dfa132ecd53	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	1	09:00:00	17:00:00	15	1	t	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-03-03 08:31:18.448795+00	2026-03-03 08:31:18.448795+00	\N
09333df0-4ff2-4af0-a8b5-9a0206e318b7	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	2	09:00:00	17:00:00	30	1	t	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-03-03 08:31:18.448795+00	2026-03-03 08:31:18.448795+00	\N
a702bc2c-a5a4-4b11-a75a-3bde4429ce73	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	3	09:00:00	17:00:00	15	1	t	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-03-03 08:31:18.448795+00	2026-03-03 08:31:18.448795+00	\N
2faff895-6b2d-4c67-b35f-867c0ce8eb2b	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	4	09:00:00	17:00:00	30	1	t	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-03-03 08:31:18.448795+00	2026-03-03 08:31:18.448795+00	\N
b4c69c53-2354-4432-8bda-93266ecbe00d	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	5	09:00:00	17:00:00	15	1	t	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-03-03 08:31:18.448795+00	2026-03-03 08:31:18.448795+00	\N
3823eba0-c297-4d50-a551-da67655857a3	9478b7a6-2231-4657-8e14-d08284cb368b	5444d315-73e2-4d85-8f92-1b4e4fbd0e52	6	09:00:00	17:00:00	30	1	f	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	2026-03-03 08:31:18.448795+00	2026-03-03 08:31:18.448795+00	\N
\.


--
-- Data for Name: vet_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_services (id, code, name, description, default_duration_minutes, default_fee, service_type, status, created_by, updated_by, created_at, updated_at, deleted_at) FROM stdin;
1b56d34a-7cbf-4fc1-9090-1cadbfe539c9	consult1	consultation	\N	30	49.80	\N	1	0800678a-4d55-42bb-b75a-b21d91123c62	\N	2026-01-26 10:47:10.359711+00	2026-01-26 10:47:10.359711+00	\N
0cfaf180-345f-4639-9ba1-f2bae9333e1a	consult2	Dog	\N	30	39.83	\N	1	0800678a-4d55-42bb-b75a-b21d91123c62	\N	2026-01-26 11:08:21.961884+00	2026-01-26 11:08:21.961884+00	\N
d4d0f76b-9705-4683-8d36-05cd785e2242	TS1	Test Service	\N	30	50.00	\N	1	ab553ba0-1a60-4ca6-95ff-a5f22d0dc9e2	\N	2026-01-26 12:12:17.376811+00	2026-01-26 12:12:17.376811+00	\N
8bd376ae-f3c4-46c0-a392-805beefaaecc	AS1	Another Service	\N	30	75.00	\N	1	517a4c9c-4c0b-46ce-8dbd-af8cfa90611a	\N	2026-01-26 12:15:47.914685+00	2026-01-26 12:15:47.914685+00	\N
c91e73ad-1641-4666-bc03-a4a6ea281204	consult	consultation1	\N	30	50.00	\N	0	0800678a-4d55-42bb-b75a-b21d91123c62	\N	2026-01-26 10:45:57.052182+00	2026-02-05 15:02:54.195534+00	\N
\.


--
-- Data for Name: vet_vaccinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vet_vaccinations (id, pet_id, appointment_id, veterinarian_id, vaccine_name, vaccine_type, manufacturer, batch_number, vaccination_date, next_due_date, site_of_injection, adverse_reactions, cost, notes, certificate_issued, certificate_number, created_by, updated_by, created_at, updated_at, deleted_at, medical_record_id) FROM stdin;
cb7b9fa7-74f7-48df-89f1-14b8bed92e7c	cc02cf46-59f2-4dfa-af42-ab31722df1db	819cba56-30b4-4fbf-b51d-320ad9cabb24	9478b7a6-2231-4657-8e14-d08284cb368b	Rabies	rabies	manufacture	rw5671	2026-02-03	\N	\N	\N	49.78	\N	f	\N	1e6b7678-2793-4e6d-8d2a-aa36a23a07df	\N	2026-02-03 12:58:42.209854+00	2026-02-03 14:33:12.738097+00	\N	c7fae492-18ea-4fc8-a7e1-4451ad55d675
\.


--
-- Data for Name: veterinarians; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.veterinarians (id, employee_id, license_number, specialization, qualification, experience_years, consultation_fee, emergency_fee, bio, avatar_url, status, is_available_for_emergency, rating, total_appointments, created_by, updated_by, deleted_by, created_at, updated_at, deleted_at, user_id) FROM stdin;
8811e8dd-88f1-4c61-8720-61aaf3c16e1b	\N	LIC-8765	\N	\N	0	0.00	0.00	\N	\N	1	f	0.00	0	0800678a-4d55-42bb-b75a-b21d91123c62	\N	\N	2026-01-26 12:42:27.181459+00	2026-01-26 17:44:28.189709+00	\N	0800678a-4d55-42bb-b75a-b21d91123c62
84c6da17-2159-42b2-bf03-26d4161716b4	\N	LIC-67890	\N	\N	0	0.00	0.00	\N	\N	0	f	0.00	0	517a4c9c-4c0b-46ce-8dbd-af8cfa90611a	\N	\N	2026-01-26 12:18:25.988842+00	2026-01-26 17:44:28.189709+00	\N	085a200d-4046-4457-a758-c5d0b682ff32
9478b7a6-2231-4657-8e14-d08284cb368b	\N	LIC-8762	\N	\N	0	0.00	0.00	\N	\N	1	f	5.00	0	0800678a-4d55-42bb-b75a-b21d91123c62	\N	\N	2026-01-27 07:17:17.255409+00	2026-02-08 13:44:36.367795+00	\N	1e6b7678-2793-4e6d-8d2a-aa36a23a07df
274bb541-09f1-44d7-bcc0-d16242fc6cf1	\N	LIC-5142364	\N	\N	0	0.00	0.00	\N	\N	1	f	0.00	0	ccf7ad25-bf06-4b29-91f9-54627fae6a4f	\N	\N	2026-02-24 22:14:24.41382+00	2026-02-24 22:14:24.41382+00	\N	e616b011-dbae-491c-9142-a25f2e2d07bd
\.


--
-- Name: vet_appointment_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vet_appointment_seq', 13, true);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: breeds breeds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_pkey PRIMARY KEY (id);


--
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- Name: in_app_notifications in_app_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id);


--
-- Name: notification_channels notification_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_channels
    ADD CONSTRAINT notification_channels_pkey PRIMARY KEY (id);


--
-- Name: notification_channels notification_channels_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_channels
    ADD CONSTRAINT notification_channels_slug_key UNIQUE (slug);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_template_translations notification_template_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_template_translations
    ADD CONSTRAINT notification_template_translations_pkey PRIMARY KEY (id);


--
-- Name: notification_template_translations notification_template_translations_template_id_locale_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_template_translations
    ADD CONSTRAINT notification_template_translations_template_id_locale_key UNIQUE (template_id, locale);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_template_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_template_key_key UNIQUE (template_key);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_token_key UNIQUE (token);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: pet_types pet_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet_types
    ADD CONSTRAINT pet_types_pkey PRIMARY KEY (id);


--
-- Name: pets pets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_slug_key UNIQUE (slug);


--
-- Name: veterinarians uk_veterinarians_user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT uk_veterinarians_user_id UNIQUE (user_id);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_user_id_notification_key_chan_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_notification_key_chan_key UNIQUE (user_id, notification_key, channel);


--
-- Name: user_notifications user_notifications_notification_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_notification_id_user_id_key UNIQUE (notification_id, user_id);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, permission_id);


--
-- Name: user_push_tokens user_push_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_push_tokens
    ADD CONSTRAINT user_push_tokens_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vet_appointment_payments vet_appointment_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_pkey PRIMARY KEY (id);


--
-- Name: vet_appointment_queue vet_appointment_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_queue
    ADD CONSTRAINT vet_appointment_queue_pkey PRIMARY KEY (id);


--
-- Name: vet_appointment_reminders vet_appointment_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_reminders
    ADD CONSTRAINT vet_appointment_reminders_pkey PRIMARY KEY (id);


--
-- Name: vet_appointment_reschedules vet_appointment_reschedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_reschedules
    ADD CONSTRAINT vet_appointment_reschedules_pkey PRIMARY KEY (id);


--
-- Name: vet_appointments vet_appointments_appointment_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_appointment_number_key UNIQUE (appointment_number);


--
-- Name: vet_appointments vet_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_pkey PRIMARY KEY (id);


--
-- Name: vet_clinic_mappings vet_clinic_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_clinic_mappings
    ADD CONSTRAINT vet_clinic_mappings_pkey PRIMARY KEY (id);


--
-- Name: vet_clinics vet_clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_clinics
    ADD CONSTRAINT vet_clinics_pkey PRIMARY KEY (id);


--
-- Name: vet_lab_tests vet_lab_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_pkey PRIMARY KEY (id);


--
-- Name: vet_medical_records vet_medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_pkey PRIMARY KEY (id);


--
-- Name: vet_payment_transactions vet_payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_payment_transactions
    ADD CONSTRAINT vet_payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: vet_prescription_medications vet_prescription_medications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescription_medications
    ADD CONSTRAINT vet_prescription_medications_pkey PRIMARY KEY (id);


--
-- Name: vet_prescriptions vet_prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_pkey PRIMARY KEY (id);


--
-- Name: vet_prescriptions vet_prescriptions_prescription_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_prescription_number_key UNIQUE (prescription_number);


--
-- Name: vet_reviews vet_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_reviews
    ADD CONSTRAINT vet_reviews_pkey PRIMARY KEY (id);


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_pkey PRIMARY KEY (id);


--
-- Name: vet_schedules vet_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_pkey PRIMARY KEY (id);


--
-- Name: vet_services vet_services_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_services
    ADD CONSTRAINT vet_services_code_key UNIQUE (code);


--
-- Name: vet_services vet_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_services
    ADD CONSTRAINT vet_services_pkey PRIMARY KEY (id);


--
-- Name: vet_vaccinations vet_vaccinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_pkey PRIMARY KEY (id);


--
-- Name: veterinarians veterinarians_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_pkey PRIMARY KEY (id);


--
-- Name: email_verifications_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_verifications_expires_at_idx ON public.email_verifications USING btree (expires_at);


--
-- Name: email_verifications_token_hash_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_verifications_token_hash_idx ON public.email_verifications USING btree (token_hash);


--
-- Name: email_verifications_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_verifications_user_id_idx ON public.email_verifications USING btree (user_id);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_breeds_name_pet_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_breeds_name_pet_type ON public.breeds USING btree (lower(name), pet_type_id);


--
-- Name: idx_breeds_pet_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_breeds_pet_type_id ON public.breeds USING btree (pet_type_id);


--
-- Name: idx_in_app_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notifications_created_at ON public.in_app_notifications USING btree (created_at DESC);


--
-- Name: idx_in_app_notifications_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notifications_created_by ON public.in_app_notifications USING btree (created_by);


--
-- Name: idx_in_app_notifications_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notifications_scheduled ON public.in_app_notifications USING btree (scheduled_at);


--
-- Name: idx_in_app_notifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notifications_status ON public.in_app_notifications USING btree (status);


--
-- Name: idx_in_app_notifications_target; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notifications_target ON public.in_app_notifications USING btree (target_type);


--
-- Name: idx_in_app_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notifications_type ON public.in_app_notifications USING btree (type);


--
-- Name: idx_notification_channels_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_channels_slug ON public.notification_channels USING btree (lower(slug));


--
-- Name: idx_notification_logs_notification_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_logs_notification_id ON public.notification_logs USING btree (notification_id);


--
-- Name: idx_notification_template_translations_locale; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_template_translations_locale ON public.notification_template_translations USING btree (locale);


--
-- Name: idx_notification_templates_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_templates_key ON public.notification_templates USING btree (lower(template_key));


--
-- Name: idx_notifications_scheduled_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_scheduled_at ON public.notifications USING btree (scheduled_at);


--
-- Name: idx_notifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_password_resets_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_resets_expires_at ON public.password_resets USING btree (expires_at);


--
-- Name: idx_password_resets_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_resets_user_id ON public.password_resets USING btree (user_id);


--
-- Name: idx_payment_transactions_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_transactions_payment_id ON public.vet_payment_transactions USING btree (payment_id);


--
-- Name: idx_pet_types_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_pet_types_name ON public.pet_types USING btree (lower(name));


--
-- Name: idx_pet_types_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_pet_types_slug ON public.pet_types USING btree (lower(slug));


--
-- Name: idx_pets_breed_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pets_breed_id ON public.pets USING btree (breed_id);


--
-- Name: idx_pets_pet_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pets_pet_type_id ON public.pets USING btree (pet_type_id);


--
-- Name: idx_pets_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pets_user_id ON public.pets USING btree (user_id);


--
-- Name: idx_pets_user_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_pets_user_slug ON public.pets USING btree (user_id, lower(slug));


--
-- Name: idx_settings_key_namespace; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_settings_key_namespace ON public.app_settings USING btree (namespace, lower(key));


--
-- Name: idx_user_addresses_is_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_addresses_is_primary ON public.user_addresses USING btree (user_id, is_primary);


--
-- Name: idx_user_addresses_postal_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_addresses_postal_code ON public.user_addresses USING btree (postal_code);


--
-- Name: idx_user_addresses_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_addresses_user_id ON public.user_addresses USING btree (user_id);


--
-- Name: idx_user_notification_preferences_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notification_preferences_user_id ON public.user_notification_preferences USING btree (user_id);


--
-- Name: idx_user_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notifications_created_at ON public.user_notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_user_notifications_notification_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notifications_notification_id ON public.user_notifications USING btree (notification_id);


--
-- Name: idx_user_notifications_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notifications_unread ON public.user_notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_user_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_notifications_user_id ON public.user_notifications USING btree (user_id);


--
-- Name: idx_user_push_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_push_tokens_token ON public.user_push_tokens USING btree (token);


--
-- Name: idx_user_push_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_push_tokens_user_id ON public.user_push_tokens USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (lower(email));


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_vet_appointments_clinic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_appointments_clinic_id ON public.vet_appointments USING btree (clinic_id);


--
-- Name: idx_vet_appointments_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_appointments_date ON public.vet_appointments USING btree (appointment_date);


--
-- Name: idx_vet_appointments_pet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_appointments_pet_id ON public.vet_appointments USING btree (pet_id);


--
-- Name: idx_vet_appointments_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_appointments_service_id ON public.vet_appointments USING btree (service_id);


--
-- Name: idx_vet_appointments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_appointments_status ON public.vet_appointments USING btree (status);


--
-- Name: idx_vet_appointments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_appointments_user_id ON public.vet_appointments USING btree (user_id);


--
-- Name: idx_vet_appointments_vet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_appointments_vet_id ON public.vet_appointments USING btree (veterinarian_id);


--
-- Name: idx_vet_clinic_mappings_clinic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_clinic_mappings_clinic_id ON public.vet_clinic_mappings USING btree (clinic_id);


--
-- Name: idx_vet_clinic_mappings_vet_clinic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_vet_clinic_mappings_vet_clinic ON public.vet_clinic_mappings USING btree (veterinarian_id, clinic_id);


--
-- Name: idx_vet_clinic_mappings_vet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_clinic_mappings_vet_id ON public.vet_clinic_mappings USING btree (veterinarian_id);


--
-- Name: idx_vet_clinics_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_clinics_branch_id ON public.vet_clinics USING btree (branch_id);


--
-- Name: idx_vet_clinics_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_vet_clinics_slug ON public.vet_clinics USING btree (lower(slug));


--
-- Name: idx_vet_exceptions_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_exceptions_date ON public.vet_schedule_exceptions USING btree (exception_date);


--
-- Name: idx_vet_exceptions_vet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_exceptions_vet_id ON public.vet_schedule_exceptions USING btree (veterinarian_id);


--
-- Name: idx_vet_lab_tests_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_lab_tests_deleted_at ON public.vet_lab_tests USING btree (deleted_at);


--
-- Name: idx_vet_lab_tests_pet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_lab_tests_pet_id ON public.vet_lab_tests USING btree (pet_id);


--
-- Name: idx_vet_lab_tests_record_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_lab_tests_record_id ON public.vet_lab_tests USING btree (medical_record_id);


--
-- Name: idx_vet_lab_tests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_lab_tests_status ON public.vet_lab_tests USING btree (status);


--
-- Name: idx_vet_medical_records_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_medical_records_appointment_id ON public.vet_medical_records USING btree (appointment_id);


--
-- Name: idx_vet_medical_records_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_medical_records_deleted_at ON public.vet_medical_records USING btree (deleted_at);


--
-- Name: idx_vet_medical_records_pet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_medical_records_pet_id ON public.vet_medical_records USING btree (pet_id);


--
-- Name: idx_vet_medical_records_record_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_medical_records_record_date ON public.vet_medical_records USING btree (record_date);


--
-- Name: idx_vet_medical_records_vet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_medical_records_vet_id ON public.vet_medical_records USING btree (veterinarian_id);


--
-- Name: idx_vet_medications_prescription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_medications_prescription_id ON public.vet_prescription_medications USING btree (prescription_id);


--
-- Name: idx_vet_payments_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_payments_appointment_id ON public.vet_appointment_payments USING btree (appointment_id);


--
-- Name: idx_vet_payments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_payments_user_id ON public.vet_appointment_payments USING btree (user_id);


--
-- Name: idx_vet_prescriptions_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_prescriptions_appointment_id ON public.vet_prescriptions USING btree (appointment_id);


--
-- Name: idx_vet_prescriptions_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_prescriptions_deleted_at ON public.vet_prescriptions USING btree (deleted_at);


--
-- Name: idx_vet_prescriptions_pet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_prescriptions_pet_id ON public.vet_prescriptions USING btree (pet_id);


--
-- Name: idx_vet_prescriptions_record_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_prescriptions_record_id ON public.vet_prescriptions USING btree (medical_record_id);


--
-- Name: idx_vet_prescriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_prescriptions_status ON public.vet_prescriptions USING btree (status);


--
-- Name: idx_vet_queue_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_queue_appointment_id ON public.vet_appointment_queue USING btree (appointment_id);


--
-- Name: idx_vet_queue_clinic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_queue_clinic_id ON public.vet_appointment_queue USING btree (clinic_id);


--
-- Name: idx_vet_reminders_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_reminders_appointment_id ON public.vet_appointment_reminders USING btree (appointment_id);


--
-- Name: idx_vet_reschedules_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_reschedules_appointment_id ON public.vet_appointment_reschedules USING btree (appointment_id);


--
-- Name: idx_vet_reviews_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_reviews_appointment_id ON public.vet_reviews USING btree (appointment_id);


--
-- Name: idx_vet_reviews_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_reviews_user_id ON public.vet_reviews USING btree (user_id);


--
-- Name: idx_vet_reviews_vet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_reviews_vet_id ON public.vet_reviews USING btree (veterinarian_id);


--
-- Name: idx_vet_schedules_clinic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_schedules_clinic_id ON public.vet_schedules USING btree (clinic_id);


--
-- Name: idx_vet_schedules_vet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_schedules_vet_id ON public.vet_schedules USING btree (veterinarian_id);


--
-- Name: idx_vet_services_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_services_code ON public.vet_services USING btree (lower(code));


--
-- Name: idx_vet_services_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_services_name ON public.vet_services USING btree (lower(name));


--
-- Name: idx_vet_vaccinations_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_vaccinations_appointment_id ON public.vet_vaccinations USING btree (appointment_id);


--
-- Name: idx_vet_vaccinations_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_vaccinations_deleted_at ON public.vet_vaccinations USING btree (deleted_at);


--
-- Name: idx_vet_vaccinations_medical_record_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_vaccinations_medical_record_id ON public.vet_vaccinations USING btree (medical_record_id);


--
-- Name: idx_vet_vaccinations_next_due_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_vaccinations_next_due_date ON public.vet_vaccinations USING btree (next_due_date);


--
-- Name: idx_vet_vaccinations_pet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_vaccinations_pet_id ON public.vet_vaccinations USING btree (pet_id);


--
-- Name: idx_vet_vaccinations_vaccination_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vet_vaccinations_vaccination_date ON public.vet_vaccinations USING btree (vaccination_date);


--
-- Name: idx_veterinarians_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_veterinarians_employee_id ON public.veterinarians USING btree (employee_id);


--
-- Name: idx_veterinarians_license; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_veterinarians_license ON public.veterinarians USING btree (lower(license_number));


--
-- Name: idx_veterinarians_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_veterinarians_user_id ON public.veterinarians USING btree (user_id);


--
-- Name: breeds breeds_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER breeds_touch_updated_at BEFORE UPDATE ON public.breeds FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: in_app_notifications in_app_notifications_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER in_app_notifications_touch_updated_at BEFORE UPDATE ON public.in_app_notifications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: permissions permissions_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER permissions_touch_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: pet_types pet_types_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER pet_types_touch_updated_at BEFORE UPDATE ON public.pet_types FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: pets pets_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER pets_touch_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: roles roles_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER roles_touch_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: users users_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER users_touch_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_appointment_payments vet_appointment_payments_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_appointment_payments_touch_updated_at BEFORE UPDATE ON public.vet_appointment_payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_appointment_queue vet_appointment_queue_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_appointment_queue_touch_updated_at BEFORE UPDATE ON public.vet_appointment_queue FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_appointment_reminders vet_appointment_reminders_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_appointment_reminders_touch_updated_at BEFORE UPDATE ON public.vet_appointment_reminders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_appointments vet_appointments_assign_number_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_appointments_assign_number_trigger BEFORE INSERT ON public.vet_appointments FOR EACH ROW EXECUTE FUNCTION public.vet_appointments_assign_number();


--
-- Name: vet_appointments vet_appointments_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_appointments_touch_updated_at BEFORE UPDATE ON public.vet_appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_clinic_mappings vet_clinic_mappings_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_clinic_mappings_touch_updated_at BEFORE UPDATE ON public.vet_clinic_mappings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_clinics vet_clinics_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_clinics_touch_updated_at BEFORE UPDATE ON public.vet_clinics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_lab_tests vet_lab_tests_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_lab_tests_touch_updated_at BEFORE UPDATE ON public.vet_lab_tests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_medical_records vet_medical_records_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_medical_records_touch_updated_at BEFORE UPDATE ON public.vet_medical_records FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_payment_transactions vet_payment_transactions_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_payment_transactions_touch_updated_at BEFORE UPDATE ON public.vet_payment_transactions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_prescription_medications vet_prescription_medications_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_prescription_medications_touch_updated_at BEFORE UPDATE ON public.vet_prescription_medications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_prescriptions vet_prescriptions_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_prescriptions_touch_updated_at BEFORE UPDATE ON public.vet_prescriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_reviews vet_reviews_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_reviews_touch_updated_at BEFORE UPDATE ON public.vet_reviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_schedules vet_schedules_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_schedules_touch_updated_at BEFORE UPDATE ON public.vet_schedules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_services vet_services_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_services_touch_updated_at BEFORE UPDATE ON public.vet_services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: vet_vaccinations vet_vaccinations_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER vet_vaccinations_touch_updated_at BEFORE UPDATE ON public.vet_vaccinations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: veterinarians veterinarians_touch_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER veterinarians_touch_updated_at BEFORE UPDATE ON public.veterinarians FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: app_settings app_settings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: app_settings app_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: breeds breeds_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: breeds breeds_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: breeds breeds_pet_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_pet_type_id_fkey FOREIGN KEY (pet_type_id) REFERENCES public.pet_types(id) ON DELETE CASCADE;


--
-- Name: breeds breeds_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: email_verifications email_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: veterinarians fk_veterinarians_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT fk_veterinarians_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: in_app_notifications in_app_notifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_logs notification_logs_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE SET NULL;


--
-- Name: notification_template_translations notification_template_translations_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_template_translations
    ADD CONSTRAINT notification_template_translations_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.notification_templates(id) ON DELETE CASCADE;


--
-- Name: notification_templates notification_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_templates notification_templates_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pet_types pet_types_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet_types
    ADD CONSTRAINT pet_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: pet_types pet_types_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet_types
    ADD CONSTRAINT pet_types_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: pet_types pet_types_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet_types
    ADD CONSTRAINT pet_types_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: pets pets_breed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.breeds(id) ON DELETE SET NULL;


--
-- Name: pets pets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: pets pets_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: pets pets_pet_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_pet_type_id_fkey FOREIGN KEY (pet_type_id) REFERENCES public.pet_types(id) ON DELETE RESTRICT;


--
-- Name: pets pets_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: pets pets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: app_settings settings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT settings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: app_settings settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_addresses user_addresses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_addresses user_addresses_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_addresses user_addresses_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_notification_preferences user_notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.in_app_notifications(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_push_tokens user_push_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_push_tokens
    ADD CONSTRAINT user_push_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_payments vet_appointment_payments_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_payments vet_appointment_payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_appointment_payments vet_appointment_payments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_appointment_payments vet_appointment_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_payments
    ADD CONSTRAINT vet_appointment_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_queue vet_appointment_queue_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_queue
    ADD CONSTRAINT vet_appointment_queue_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_queue vet_appointment_queue_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_queue
    ADD CONSTRAINT vet_appointment_queue_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_reminders vet_appointment_reminders_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_reminders
    ADD CONSTRAINT vet_appointment_reminders_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_appointment_reschedules vet_appointment_reschedules_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointment_reschedules
    ADD CONSTRAINT vet_appointment_reschedules_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_appointments vet_appointments_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE CASCADE;


--
-- Name: vet_appointments vet_appointments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_appointments vet_appointments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: vet_appointments vet_appointments_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_appointments vet_appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.vet_services(id) ON DELETE SET NULL;


--
-- Name: vet_appointments vet_appointments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_appointments vet_appointments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vet_appointments vet_appointments_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_appointments
    ADD CONSTRAINT vet_appointments_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_clinic_mappings vet_clinic_mappings_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_clinic_mappings
    ADD CONSTRAINT vet_clinic_mappings_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE CASCADE;


--
-- Name: vet_clinic_mappings vet_clinic_mappings_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_clinic_mappings
    ADD CONSTRAINT vet_clinic_mappings_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_clinics vet_clinics_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_clinics
    ADD CONSTRAINT vet_clinics_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_clinics vet_clinics_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_clinics
    ADD CONSTRAINT vet_clinics_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: vet_clinics vet_clinics_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_clinics
    ADD CONSTRAINT vet_clinics_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_lab_tests vet_lab_tests_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE SET NULL;


--
-- Name: vet_lab_tests vet_lab_tests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_lab_tests vet_lab_tests_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.vet_medical_records(id) ON DELETE CASCADE;


--
-- Name: vet_lab_tests vet_lab_tests_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_lab_tests vet_lab_tests_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_lab_tests
    ADD CONSTRAINT vet_lab_tests_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_medical_records vet_medical_records_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_medical_records vet_medical_records_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_medical_records vet_medical_records_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_medical_records vet_medical_records_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_medical_records vet_medical_records_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_medical_records
    ADD CONSTRAINT vet_medical_records_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE SET NULL;


--
-- Name: vet_payment_transactions vet_payment_transactions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_payment_transactions
    ADD CONSTRAINT vet_payment_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.vet_appointment_payments(id) ON DELETE CASCADE;


--
-- Name: vet_prescription_medications vet_prescription_medications_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescription_medications
    ADD CONSTRAINT vet_prescription_medications_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.vet_prescriptions(id) ON DELETE CASCADE;


--
-- Name: vet_prescriptions vet_prescriptions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE SET NULL;


--
-- Name: vet_prescriptions vet_prescriptions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_prescriptions vet_prescriptions_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.vet_medical_records(id) ON DELETE CASCADE;


--
-- Name: vet_prescriptions vet_prescriptions_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_prescriptions vet_prescriptions_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_prescriptions vet_prescriptions_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_prescriptions
    ADD CONSTRAINT vet_prescriptions_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE SET NULL;


--
-- Name: vet_reviews vet_reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_reviews
    ADD CONSTRAINT vet_reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE CASCADE;


--
-- Name: vet_reviews vet_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_reviews
    ADD CONSTRAINT vet_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vet_reviews vet_reviews_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_reviews
    ADD CONSTRAINT vet_reviews_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE SET NULL;


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_schedule_exceptions vet_schedule_exceptions_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedule_exceptions
    ADD CONSTRAINT vet_schedule_exceptions_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_schedules vet_schedules_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.vet_clinics(id) ON DELETE CASCADE;


--
-- Name: vet_schedules vet_schedules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_schedules vet_schedules_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_schedules vet_schedules_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_schedules
    ADD CONSTRAINT vet_schedules_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE CASCADE;


--
-- Name: vet_services vet_services_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_services
    ADD CONSTRAINT vet_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vet_services vet_services_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_services
    ADD CONSTRAINT vet_services_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: vet_vaccinations vet_vaccinations_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.vet_appointments(id) ON DELETE SET NULL;


--
-- Name: vet_vaccinations vet_vaccinations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_vaccinations vet_vaccinations_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.vet_medical_records(id) ON DELETE SET NULL;


--
-- Name: vet_vaccinations vet_vaccinations_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;


--
-- Name: vet_vaccinations vet_vaccinations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vet_vaccinations vet_vaccinations_veterinarian_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vet_vaccinations
    ADD CONSTRAINT vet_vaccinations_veterinarian_id_fkey FOREIGN KEY (veterinarian_id) REFERENCES public.veterinarians(id) ON DELETE SET NULL;


--
-- Name: veterinarians veterinarians_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: veterinarians veterinarians_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: veterinarians veterinarians_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict mMeTAERbVcY5ps8s1rtK1zH5kAoLWoe825Vv1eddez0JAP41lE8ygdVjfASlqjI

