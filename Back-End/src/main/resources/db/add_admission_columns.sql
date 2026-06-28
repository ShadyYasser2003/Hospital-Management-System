-- Add admission tracking columns to patients table
-- Run this once in MySQL Workbench if Spring Boot ddl-auto:update doesn't add them automatically

USE hms_backend;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS admission_date     DATETIME NULL,
  ADD COLUMN IF NOT EXISTS discharge_date     DATETIME NULL,
  ADD COLUMN IF NOT EXISTS bed_charge_per_day DOUBLE   NULL;

-- Fix invoices.status column type if it's ENUM (should be VARCHAR)
ALTER TABLE invoices
  MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

SELECT 'Migration complete' AS result;
