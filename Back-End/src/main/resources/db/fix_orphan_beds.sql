-- Fix orphaned bed assignments
-- Beds pointing to a user id that has no matching row in the patients table
-- (JOINED inheritance: users + patients must both have the row)
--
-- Run once in MySQL Workbench after restarting the backend.

USE hms_backend;

-- 1. Release beds whose patient_id references a non-existent patients row
UPDATE beds
SET    patient_id   = NULL,
       patient_name = NULL,
       status       = 'AVAILABLE'
WHERE  patient_id IS NOT NULL
  AND  patient_id NOT IN (SELECT patient_id FROM patients);

-- 2. Verify — should return 0 rows
SELECT id, bed_number, patient_id, status
FROM   beds
WHERE  patient_id IS NOT NULL
  AND  patient_id NOT IN (SELECT patient_id FROM patients);

SELECT 'Orphan bed cleanup complete' AS result;
