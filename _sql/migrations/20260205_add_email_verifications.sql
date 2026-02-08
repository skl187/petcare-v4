-- Migration: Add email_verifications table for email verification flow
-- Date: 2026-02-05
-- Pattern follows password_resets table

BEGIN;

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

COMMIT;

-- Verification query:
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'email_verifications';
