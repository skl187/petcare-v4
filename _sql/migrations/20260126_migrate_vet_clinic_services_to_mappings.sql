-- Migration: migrate data from vet_clinic_services -> vet_clinic_mappings.service_ids
-- 1) aggregate services per (veterinarian_id, clinic_id)
-- 2) insert mapping rows if missing, or merge service ids into existing mappings
-- Run within a transaction on the target DB

BEGIN;

-- create aggregated list of services per (vet, clinic)
WITH agg AS (
  SELECT veterinarian_id, clinic_id, jsonb_agg(DISTINCT service_id::text) AS svc_ids
  FROM vet_clinic_services
  WHERE deleted_at IS NULL
  GROUP BY veterinarian_id, clinic_id
)
-- upsert into vet_clinic_mappings; if mapping exists, merge service ids
INSERT INTO vet_clinic_mappings (veterinarian_id, clinic_id, is_primary, service_ids, created_at, updated_at)
SELECT a.veterinarian_id, a.clinic_id, false, a.svc_ids, now(), now() FROM agg a
ON CONFLICT (veterinarian_id, clinic_id) DO UPDATE
SET service_ids = (
    SELECT jsonb_agg(distinct x) FROM (
      SELECT jsonb_array_elements_text(COALESCE(vet_clinic_mappings.service_ids, '[]'::jsonb) || EXCLUDED.service_ids) AS x
    ) s
), updated_at = now();

-- Verify counts (optional):
-- SELECT COUNT(*) FROM vet_clinic_services;
-- SELECT COUNT(*) FROM vet_clinic_mappings WHERE service_ids IS NOT NULL;

COMMIT;

-- After verification you may drop the old table if desired:
-- DROP TABLE IF EXISTS vet_clinic_services;
