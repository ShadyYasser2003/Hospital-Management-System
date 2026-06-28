-- ============================================================
-- Fix orphaned user rows (users table has rows with no
-- matching row in the joined sub-table: patients, doctors, etc.)
--
-- Run this ONCE in MySQL Workbench after restarting the backend.
-- ============================================================

USE hms_backend;

-- Disable safe update mode for this session
SET SQL_SAFE_UPDATES = 0;

-- ── 1. Nullify any FK references to these orphan user IDs ──────────────────

-- Beds pointing at an orphan patient
UPDATE beds
SET    patient_id   = NULL,
       patient_name = NULL,
       status       = 'AVAILABLE'
WHERE  patient_id IS NOT NULL
  AND  patient_id NOT IN (SELECT patient_id FROM patients);

-- Appointments pointing at an orphan patient
DELETE FROM appointments
WHERE patient_id NOT IN (SELECT patient_id FROM patients);

-- Invoices / payments pointing at an orphan patient
DELETE FROM payments
WHERE patient_id NOT IN (SELECT patient_id FROM patients);

DELETE FROM invoice_items
WHERE invoice_id IN (
    SELECT id FROM invoices
    WHERE patient_id NOT IN (SELECT patient_id FROM patients)
);

DELETE FROM invoices
WHERE patient_id NOT IN (SELECT patient_id FROM patients);

-- Notifications whose recipient user no longer has a matching sub-table row
-- (covers any role, not just patient)
DELETE FROM notifications
WHERE recipient_id IN (
    SELECT u.id
    FROM   users u
    WHERE  u.role = 'PATIENT'
      AND  u.id NOT IN (SELECT patient_id FROM patients)
);

-- Refresh tokens for orphan users
DELETE FROM refresh_tokens
WHERE user_id IN (
    SELECT u.id
    FROM   users u
    WHERE  u.role = 'PATIENT'
      AND  u.id NOT IN (SELECT patient_id FROM patients)
);

-- ── 2. Delete the orphan rows from users ────────────────────────────────────
DELETE FROM users
WHERE role = 'PATIENT'
  AND id NOT IN (SELECT patient_id FROM patients);

-- ── 3. Verify – should return 0 rows ────────────────────────────────────────
SELECT u.id, u.username, u.role
FROM   users u
WHERE  u.role = 'PATIENT'
  AND  u.id NOT IN (SELECT patient_id FROM patients);

SELECT 'Orphan cleanup complete' AS result;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
