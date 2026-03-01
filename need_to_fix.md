# Database Schema — Issues & TODOs

> Generated from schema analysis comparing `schema.sql` (design) vs `full_backup.sql` (production)
> Date: 2026-02-28

---

## CRITICAL (Must Fix Before Any Fresh Deployment)

### TODO 1: Fix Forward FK Reference — Schema Execution Order

- **File:** `.sql/schema.sql` — Lines 487-488
- **Problem:** `vet_appointment_payments` references `pet_insurance_policies` and `pet_insurance_claims`, but those tables are defined ~400 lines later. Running schema.sql on a fresh DB will fail with `"relation does not exist"`.
- **How to fix:**
  1. Move the entire **Insurance Management** section (tables: `pet_insurance_providers`, `pet_insurance_plans`, `pet_insurance_policies`, `pet_insurance_claims`, `pet_insurance_claim_items`, `pet_insurance_claim_history`, `pet_insurance_preauthorizations`, `pet_insurance_verifications`) to **before** the `vet_appointment_payments` table definition.
  2. Alternatively, if the insurance module is not yet deployed, **remove** the `policy_id` and `claim_id` FK columns from `vet_appointment_payments` and add them via a migration when the insurance module is ready.
  3. Test by running `schema.sql` against a fresh empty database to verify no ordering errors remain.

---

### TODO 2: Fix Invalid PostgreSQL Syntax — `COMMENT` on Column

- **File:** `.sql/schema.sql` — Line 838 (`pet_insurance_providers` table)
- **Problem:** `coverage_details jsonb COMMENT 'Covered services, limits, etc.',` — This is MySQL syntax, not valid PostgreSQL.
- **How to fix:**
  1. Remove the inline `COMMENT` from the column definition:
     ```sql
     coverage_details jsonb,
     ```
  2. Add a separate statement after the `CREATE TABLE`:
     ```sql
     COMMENT ON COLUMN pet_insurance_providers.coverage_details IS 'Covered services, limits, etc.';
     ```

---

### TODO 3: Fix View Dependency on Non-Existent Production Columns

- **File:** `.sql/schema.sql` — `v_appointment_split_payments` view
- **Problem:** The view references `is_partial` and `split_payment_group_id` columns that do not exist in the production `vet_appointment_payments` table. Creating this view against production will fail.
- **How to fix:**
  1. Add a migration to add the missing columns to production:
     ```sql
     ALTER TABLE vet_appointment_payments
       ADD COLUMN IF NOT EXISTS is_partial boolean NOT NULL DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS payment_sequence int,
       ADD COLUMN IF NOT EXISTS split_payment_group_id text;
     ```
  2. Or remove the view from schema.sql until the split payment feature is actually deployed.
  3. After adding columns, then create/recreate the view.

---

## HIGH (Schema Drift — Sync Design with Production)

### TODO 4: Deploy or Remove Insurance Module

- **Problem:** 8 insurance tables exist in `schema.sql` but are completely absent from production.
- **Tables:** `pet_insurance_providers`, `pet_insurance_plans`, `pet_insurance_policies`, `pet_insurance_claims`, `pet_insurance_claim_items`, `pet_insurance_claim_history`, `pet_insurance_preauthorizations`, `pet_insurance_verifications`
- **How to fix:**
  1. **If the feature is planned:** Write a versioned migration script to create all 8 tables in production. Run in staging first.
  2. **If the feature is deferred:** Move these table definitions to a separate file (e.g., `.sql/insurance_module.sql`) and remove them from the main `schema.sql`. Document the deferral.

---

### TODO 5: Sync `vet_appointment_payments` Columns

- **Problem:** Major column mismatches between design and production.
  - Design has but production missing: `policy_id`, `claim_id`, `is_partial`, `payment_sequence`, `split_payment_group_id`
  - Production has but design missing: `transaction_id`
- **How to fix:**
  1. Add `transaction_id text` to `vet_appointment_payments` in `schema.sql`.
  2. Write a migration to add the split-payment columns (`is_partial`, `payment_sequence`, `split_payment_group_id`) to production when that feature is ready.
  3. Keep `policy_id`/`claim_id` coupled with the insurance module migration (TODO 4).

---

### TODO 6: Sync `vet_payment_transactions` Columns

- **Problem:** `provider_code` and `provider_response` columns exist in `schema.sql` but are missing from production.
- **How to fix:**
  1. Write a migration:
     ```sql
     ALTER TABLE vet_payment_transactions
       ADD COLUMN IF NOT EXISTS provider_code text,
       ADD COLUMN IF NOT EXISTS provider_response jsonb;
     ```
  2. Add corresponding indexes:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider
       ON vet_payment_transactions (provider_code);
     ```

---

### TODO 7: Add Missing Tables to `schema.sql`

- **Problem:** Production has tables/functions not reflected in `schema.sql`:
  - `in_app_notifications` table (with full constraints)
  - `user_notifications` table (join table linking users to in-app notifications)
  - `vet_recalc_appointment_totals()` function
- **How to fix:**
  1. Copy the `CREATE TABLE` definitions from `full_backup.sql` for `in_app_notifications` and `user_notifications` into `schema.sql` in the Notifications section.
  2. Copy the `vet_recalc_appointment_totals()` function definition into `schema.sql` in the Appointments or Functions section.
  3. Add corresponding indexes and FK constraints.

---

### TODO 8: Fix `veterinarians.rating` Precision Mismatch

- **Problem:** `schema.sql` uses `numeric(3,2)` (max 9.99), production uses `numeric(5,2)` (max 999.99). For a 0-5 rating, `numeric(3,2)` is correct.
- **How to fix:**
  1. Run migration on production:
     ```sql
     ALTER TABLE veterinarians ALTER COLUMN rating TYPE numeric(3,2);
     ```
  2. Verify no existing values exceed 9.99 before running:
     ```sql
     SELECT id, rating FROM veterinarians WHERE rating > 9.99;
     ```

---

### TODO 9: Restore NOT NULL Constraints in Production

- **Problem:** Production has weaker constraints than design:
  | Table.Column | Design | Production |
  |---|---|---|
  | `breeds.name` | `NOT NULL` | nullable |
  | `email_verifications.token_hash` | `NOT NULL` | nullable |
  | `pet_types.slug` | `NOT NULL UNIQUE` | nullable |
- **How to fix:**
  1. First, fix any existing NULL values:
     ```sql
     UPDATE breeds SET name = 'UNKNOWN-' || id::text WHERE name IS NULL;
     UPDATE email_verifications SET token_hash = '' WHERE token_hash IS NULL;
     UPDATE pet_types SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;
     ```
  2. Then add constraints:
     ```sql
     ALTER TABLE breeds ALTER COLUMN name SET NOT NULL;
     ALTER TABLE email_verifications ALTER COLUMN token_hash SET NOT NULL;
     ALTER TABLE pet_types ALTER COLUMN slug SET NOT NULL;
     ```

---

## MEDIUM (Design & Architecture Improvements)

### TODO 10: Add Clinic Address Support

- **Problem:** `vet_clinics` has no address, city, state, postal_code, or geo-location columns. Patients need to find/visit clinics.
- **How to fix:**
  1. Option A — Add address columns directly to `vet_clinics`:
     ```sql
     ALTER TABLE vet_clinics
       ADD COLUMN IF NOT EXISTS address_line1 text,
       ADD COLUMN IF NOT EXISTS address_line2 text,
       ADD COLUMN IF NOT EXISTS city text,
       ADD COLUMN IF NOT EXISTS state text,
       ADD COLUMN IF NOT EXISTS postal_code text,
       ADD COLUMN IF NOT EXISTS country text,
       ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
       ADD COLUMN IF NOT EXISTS longitude numeric(9,6);
     ```
  2. Option B — Create a `vet_clinic_addresses` table modeled after `user_addresses` to support multiple locations per clinic.

---

### TODO 11: Add Composite Unique Constraint on `vet_schedules`

- **Problem:** No uniqueness enforced on `(veterinarian_id, clinic_id, day_of_week)` — allows duplicate schedules for the same vet/clinic/day.
- **How to fix:**
  1. Check for existing duplicates first:
     ```sql
     SELECT veterinarian_id, clinic_id, day_of_week, COUNT(*)
     FROM vet_schedules
     WHERE deleted_at IS NULL
     GROUP BY veterinarian_id, clinic_id, day_of_week
     HAVING COUNT(*) > 1;
     ```
  2. Resolve duplicates (keep the latest, delete the rest).
  3. Add the constraint:
     ```sql
     CREATE UNIQUE INDEX IF NOT EXISTS idx_vet_schedules_unique_slot
       ON vet_schedules (veterinarian_id, clinic_id, day_of_week)
       WHERE deleted_at IS NULL;
     ```

---

### TODO 12: Add Unique Constraint on `vet_reviews`

- **Problem:** No `UNIQUE (appointment_id, user_id)` — allows duplicate reviews from the same user per appointment.
- **How to fix:**
  1. Check for duplicates:
     ```sql
     SELECT appointment_id, user_id, COUNT(*)
     FROM vet_reviews
     WHERE deleted_at IS NULL
     GROUP BY appointment_id, user_id
     HAVING COUNT(*) > 1;
     ```
  2. Add constraint:
     ```sql
     CREATE UNIQUE INDEX IF NOT EXISTS idx_vet_reviews_unique_per_user
       ON vet_reviews (appointment_id, user_id)
       WHERE deleted_at IS NULL;
     ```

---

### TODO 13: Fix Inconsistent `ON DELETE` on Audit FK Columns

- **Problem:** `created_by`/`updated_by`/`deleted_by` FKs on `breeds`, `pet_types`, `vet_clinics`, `veterinarians`, `vet_schedules`, `vet_schedule_exceptions` default to `NO ACTION`. If a user is deleted, these FK constraints block the delete.
- **How to fix:**
  1. Drop and re-add each FK with `ON DELETE SET NULL`. Example for `breeds`:
     ```sql
     ALTER TABLE breeds DROP CONSTRAINT IF EXISTS breeds_created_by_fkey;
     ALTER TABLE breeds ADD CONSTRAINT breeds_created_by_fkey
       FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

     ALTER TABLE breeds DROP CONSTRAINT IF EXISTS breeds_updated_by_fkey;
     ALTER TABLE breeds ADD CONSTRAINT breeds_updated_by_fkey
       FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

     ALTER TABLE breeds DROP CONSTRAINT IF EXISTS breeds_deleted_by_fkey;
     ALTER TABLE breeds ADD CONSTRAINT breeds_deleted_by_fkey
       FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;
     ```
  2. Repeat for all affected tables: `pet_types`, `vet_clinics`, `veterinarians`, `vet_schedules`, `vet_schedule_exceptions`, `vet_services`.
  3. Update `schema.sql` to include `ON DELETE SET NULL` on all audit FK columns.

---

### TODO 14: Resolve `vet_clinics.branch_id` — Phantom FK

- **Problem:** `branch_id uuid` has an index but no FK constraint pointing to any table. Orphaned/undocumented.
- **How to fix:**
  1. **If self-referencing (branches of the same clinic chain):** Add FK:
     ```sql
     ALTER TABLE vet_clinics
       ADD CONSTRAINT vet_clinics_branch_id_fkey
       FOREIGN KEY (branch_id) REFERENCES vet_clinics(id) ON DELETE SET NULL;
     ```
  2. **If unused:** Drop the column and its index:
     ```sql
     DROP INDEX IF EXISTS idx_vet_clinics_branch_id;
     ALTER TABLE vet_clinics DROP COLUMN IF EXISTS branch_id;
     ```
  3. Add a code comment in `schema.sql` documenting the decision.

---

### TODO 15: Standardize Soft Delete Policy

- **Problem:** Inconsistent — some tables have `deleted_at`, others don't.
  - **Missing `deleted_at`:** `vet_schedule_exceptions`, `vet_appointment_reschedules`, `vet_appointment_queue`, `vet_appointment_reminders`, `audit_logs`
- **How to fix:**
  1. Decide on policy: either all mutable entities get `deleted_at`, or document which ones are excluded and why.
  2. If adding soft delete:
     ```sql
     ALTER TABLE vet_schedule_exceptions ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
     ALTER TABLE vet_appointment_reminders ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
     ALTER TABLE vet_appointment_queue ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
     ```
  3. `audit_logs` and `vet_appointment_reschedules` are append-only by design — document that they intentionally lack `deleted_at`.

---

### TODO 16: Reconsider Global Appointment Sequence

- **Problem:** `vet_appointment_seq` is a single global sequence. In multi-clinic setups, appointment numbers have gaps per clinic/day (e.g., clinic A gets #1, #3, #7 while B gets #2, #4, #5).
- **How to fix:**
  1. **Option A (simple):** Accept gaps — UUIDs are the real PK. Document that the number is a global counter, not per-clinic.
  2. **Option B (per-clinic numbering):** Replace the sequence with a counter table:
     ```sql
     CREATE TABLE IF NOT EXISTS clinic_appointment_counters (
       clinic_id uuid PRIMARY KEY REFERENCES vet_clinics(id) ON DELETE CASCADE,
       last_number int NOT NULL DEFAULT 0
     );
     ```
     Update `generate_appointment_number()` to atomically increment per clinic.
  3. **Option C:** Use a date-based composite: `APPT-{clinic_slug}-{YYYYMMDD}-{daily_counter}` with a daily reset.

---

### TODO 17: Remove Unused `uuid-ossp` Extension

- **Problem:** `uuid-ossp` is loaded but never used. All tables use `gen_random_uuid()` from `pgcrypto`.
- **How to fix:**
  1. Remove from `schema.sql`:
     ```sql
     -- DELETE THIS LINE:
     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
     ```
  2. In production, drop after verifying no dependency:
     ```sql
     DROP EXTENSION IF EXISTS "uuid-ossp";
     ```

---

### TODO 18: Remove Dead Code — `create_updated_at_trigger()` Function

- **Problem:** This helper function is defined in `schema.sql` but never called. The `DO` block at the bottom creates triggers using inline `EXECUTE format(...)` directly.
- **How to fix:**
  1. Remove the function from `schema.sql` (lines 20-31):
     ```sql
     -- DELETE THIS BLOCK:
     CREATE OR REPLACE FUNCTION create_updated_at_trigger(table_name text) ...
     ```
  2. Or keep it and refactor the `DO` block to use it — but pick one canonical approach.

---

## LOW (Cleanup & Data Quality)

### TODO 19: Fix Malformed Appointment Numbers in Production Data

- **Problem:** Existing data has whitespace-padded numbers: `APPT-yashoda1-20260126-     1` (5 spaces before "1").
- **How to fix:**
  1. Clean existing data:
     ```sql
     UPDATE vet_appointments
     SET appointment_number = regexp_replace(appointment_number, '\s+', '', 'g')
     WHERE appointment_number ~ '\s';
     ```
  2. Verify the `generate_appointment_number()` function now produces clean output (the current `FM000000` format should be correct).

---

### TODO 20: Resolve Token / Token Hash Redundancy

- **Problem:** Both `password_resets` and `email_verifications` store a plain `token` (UNIQUE) and a `token_hash`. Storing both is either redundant or a security concern.
- **How to fix:**
  1. **Recommended:** Store only `token_hash`. Remove the plain `token` column. Hash the token before lookup.
     ```sql
     ALTER TABLE password_resets DROP COLUMN IF EXISTS token;
     ALTER TABLE email_verifications DROP COLUMN IF EXISTS token;
     ```
  2. Update application code to hash the token before querying:
     ```js
     const hash = crypto.createHash('sha256').update(token).digest('hex');
     // Look up by token_hash instead of token
     ```
  3. If the plain token must be kept for legacy reasons, at minimum remove the `UNIQUE` constraint on `token` and make `token_hash` the indexed lookup key.

---

### TODO 21: Standardize Database Ownership

- **Problem:** Tables are split between `dbadmin` (core tables) and `admin` (notification + address tables), indicating different users ran different migrations.
- **How to fix:**
  1. Pick one application DB owner (e.g., `dbadmin`).
  2. Reassign ownership:
     ```sql
     ALTER TABLE user_addresses OWNER TO dbadmin;
     ALTER TABLE notification_channels OWNER TO dbadmin;
     ALTER TABLE notification_templates OWNER TO dbadmin;
     ALTER TABLE notification_template_translations OWNER TO dbadmin;
     ALTER TABLE notification_logs OWNER TO dbadmin;
     ALTER TABLE notifications OWNER TO dbadmin;
     ALTER TABLE user_notification_preferences OWNER TO dbadmin;
     ALTER TABLE user_push_tokens OWNER TO dbadmin;
     ALTER TABLE app_settings OWNER TO dbadmin;
     ALTER TABLE in_app_notifications OWNER TO dbadmin;
     ALTER TABLE user_notifications OWNER TO dbadmin;
     ```
  3. Ensure all migrations run as the same DB user going forward.

---

### TODO 22: Remove Redundant `pets.age` Column

- **Problem:** Both `date_of_birth` and `age` (text) exist. Age is derivable from DOB and storing it as text creates stale data.
- **How to fix:**
  1. Confirm all reads use computed age, not the stored column:
     ```sql
     -- Use this in queries instead:
     EXTRACT(YEAR FROM age(now(), date_of_birth))
     ```
  2. Drop the column after updating application code:
     ```sql
     ALTER TABLE pets DROP COLUMN IF EXISTS age;
     ```
  3. Or if keeping for legacy, make it a generated column (Postgres 12+):
     ```sql
     -- Not straightforward for text, better to drop and compute in app
     ```

---

### TODO 23: Replace `vet_service_ids` JSONB Array with Junction Table

- **Problem:** `vet_appointments.vet_service_ids` stores service references as a JSONB array — bypasses FK enforcement. Non-existent service IDs can be stored without error.
- **How to fix:**
  1. Create a proper junction table:
     ```sql
     CREATE TABLE IF NOT EXISTS vet_appointment_services (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       appointment_id uuid NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
       service_id uuid NOT NULL REFERENCES vet_services(id) ON DELETE CASCADE,
       quantity int NOT NULL DEFAULT 1,
       unit_fee numeric(10,2) NOT NULL DEFAULT 0.00,
       discount_amount numeric(10,2) DEFAULT 0.00,
       created_at timestamptz NOT NULL DEFAULT now(),
       UNIQUE (appointment_id, service_id)
     );
     ```
  2. Migrate existing JSONB data:
     ```sql
     INSERT INTO vet_appointment_services (appointment_id, service_id, quantity, unit_fee)
     SELECT
       a.id,
       (elem->>'service_id')::uuid,
       COALESCE((elem->>'quantity')::int, 1),
       COALESCE((elem->>'unit_fee')::numeric, 0.00)
     FROM vet_appointments a,
          jsonb_array_elements(a.vet_service_ids) AS elem
     WHERE jsonb_typeof(a.vet_service_ids) = 'array'
       AND jsonb_array_length(a.vet_service_ids) > 0;
     ```
  3. Update application code to read/write from the junction table.
  4. After full migration, drop the JSONB column:
     ```sql
     ALTER TABLE vet_appointments DROP COLUMN IF EXISTS vet_service_ids;
     ALTER TABLE vet_appointments DROP COLUMN IF EXISTS service_id;
     ALTER TABLE vet_appointments DROP COLUMN IF EXISTS service_fee;
     ```
  5. Note: `vet_recalc_appointment_totals()` in production already uses `vet_appointment_services` — this table may have been created manually but wasn't captured in `schema.sql`.

---

## Summary

| Priority | Count | Status |
|---|---|---|
| **CRITICAL** | 3 (TODOs 1-3) | Must fix before any fresh deployment |
| **HIGH** | 6 (TODOs 4-9) | Sync schema with production via migrations |
| **MEDIUM** | 9 (TODOs 10-18) | Plan for next sprint |
| **LOW** | 5 (TODOs 19-23) | Address during cleanup/refactor |
| **Total** | **23** | |


in v2
-----
role is is primary