-- ============================================================
-- Blood Bank Module — Legacy Data Migration
-- Project  : HMS new_backend
-- Version  : V2 (run AFTER V1 on databases that have legacy data)
--
-- Migrates data from the OLD schema (Hms-_Ver2 legacy)
-- into the new schema created by V1.
--
-- SAFE TO RUN: uses INSERT IGNORE + WHERE NOT EXISTS guards.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- STEP 1 — Migrate blood_units
--
-- Old status values : AVAILABLE, RESERVED, EXPIRED
-- New status values : AVAILABLE, RESERVED, USED, EXPIRED
--
-- Mapping: legacy AVAILABLE → new AVAILABLE
--          legacy RESERVED  → new RESERVED
--          legacy EXPIRED   → new EXPIRED
-- ──────────────────────────────────────────────────────────────
INSERT IGNORE INTO blood_units
    (id, blood_type, quantity, expiry_date, status, notes, created_at, updated_at)
SELECT
    old.id,
    old.blood_type,
    old.quantity,

    -- Handle old schema's DATETIME expiry_date → cast to DATE
    CASE
        WHEN old.expiry_date IS NULL THEN NULL
        ELSE DATE(old.expiry_date)
    END,

    -- Status mapping: legacy had no USED status
    CASE old.status
        WHEN 'AVAILABLE' THEN 'AVAILABLE'
        WHEN 'RESERVED'  THEN 'RESERVED'
        WHEN 'EXPIRED'   THEN 'EXPIRED'
        ELSE 'AVAILABLE'   -- fallback for unexpected values
    END,

    NULL,                  -- notes column did not exist in old schema
    old.created_at,
    NULL                   -- no updated_at in old schema

FROM blood_unit old         -- ← old table name (singular, no 's')
WHERE NOT EXISTS (
    SELECT 1 FROM blood_units new WHERE new.id = old.id
);


-- ──────────────────────────────────────────────────────────────
-- STEP 2 — Migrate blood_requests
--
-- Old schema had:  patient_id, blood_type, quantity, status, created_at
-- New schema adds: doctor_id, patient_name, requested_by_name,
--                  urgency, fulfilled_at, updated_at
--
-- Old status values : PENDING, FULFILLED, CANCELLED
-- New status values : PENDING, RESERVED, COMPLETED, CANCELLED
--
-- Mapping: PENDING   → PENDING
--          FULFILLED → COMPLETED  (closest semantic equivalent)
--          CANCELLED → CANCELLED
-- ──────────────────────────────────────────────────────────────
INSERT IGNORE INTO blood_requests
    (id, patient_id, patient_name, doctor_id, requested_by_name,
     blood_type, quantity, urgency, status, notes, fulfilled_at, created_at, updated_at)
SELECT
    old.id,
    old.patient_id,

    -- patient_name: resolve from patients table if possible
    COALESCE(
        (SELECT u.name FROM patients p
         JOIN users u ON u.id = p.patient_id
         WHERE p.patient_id = old.patient_id LIMIT 1),
        CONCAT('Patient #', old.patient_id)
    ),

    -- doctor_id: old schema had no doctor FK — use a default admin/doctor id
    -- IMPORTANT: update this subquery to match the first doctor in your DB
    COALESCE(
        (SELECT d.doctor_id FROM doctors d LIMIT 1),
        1
    ),

    'Migrated Record',      -- requested_by_name placeholder

    old.blood_type,
    old.quantity,
    'MEDIUM',               -- old schema had no urgency field

    -- Status mapping
    CASE old.status
        WHEN 'PENDING'   THEN 'PENDING'
        WHEN 'FULFILLED' THEN 'COMPLETED'
        WHEN 'CANCELLED' THEN 'CANCELLED'
        ELSE 'PENDING'
    END,

    NULL,                   -- notes

    -- fulfilled_at: set for FULFILLED→COMPLETED rows
    CASE WHEN old.status = 'FULFILLED' THEN old.created_at ELSE NULL END,

    old.created_at,
    NULL

FROM blood_request old      -- ← old table name (singular)
WHERE NOT EXISTS (
    SELECT 1 FROM blood_requests new WHERE new.id = old.id
);


-- ──────────────────────────────────────────────────────────────
-- STEP 3 — Safety: mark legacy AVAILABLE units that are past
-- their expiry date as EXPIRED in the new table
-- ──────────────────────────────────────────────────────────────
UPDATE blood_units
SET    status     = 'EXPIRED',
       updated_at = NOW()
WHERE  status      = 'AVAILABLE'
  AND  expiry_date IS NOT NULL
  AND  expiry_date < CURDATE();
