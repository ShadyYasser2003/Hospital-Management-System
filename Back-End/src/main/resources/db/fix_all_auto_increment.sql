-- ============================================================
-- Fix AUTO_INCREMENT missing on ALL tables in hms_backend
--
-- Root cause: Hibernate ddl-auto=update never adds AUTO_INCREMENT
-- to existing id columns. Also, some FK columns have type mismatches
-- (INT vs BIGINT) that block the ALTER.
--
-- SOLUTION: Disable FK checks, fix all id columns + FK column types,
-- re-enable FK checks.
--
-- Safe to run multiple times. Does NOT delete any data.
-- ============================================================

USE hms_backend;

-- ── Disable FK checks so ALTERs are not blocked by constraints ────────────────
SET FOREIGN_KEY_CHECKS = 0;

-- ── Fix all id columns → AUTO_INCREMENT ──────────────────────────────────────
ALTER TABLE users                  MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE appointments           MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE beds                   MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE refresh_tokens         MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE transfer_requests      MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE lab_tests              MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE radiology_orders       MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE blood_units            MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE blood_requests         MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE external_hospitals     MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE prescription_items     MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE prescription           MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE medicine               MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE medicine_category      MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE medicine_stock         MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE medicine_dispensation  MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE department             MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE speciality             MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT;

-- ── Fix FK column types to match BIGINT parent PKs ────────────────────────────
-- doctors: speciality_id, department_id, managed_department_id
ALTER TABLE doctors MODIFY COLUMN speciality_id          BIGINT;
ALTER TABLE doctors MODIFY COLUMN department_id          BIGINT;
ALTER TABLE doctors MODIFY COLUMN managed_department_id  BIGINT;

-- nurses: department_id, speciality_id
ALTER TABLE nurses MODIFY COLUMN department_id  BIGINT;
ALTER TABLE nurses MODIFY COLUMN speciality_id  BIGINT;

-- receptionists: department_id
ALTER TABLE receptionists MODIFY COLUMN department_id BIGINT;

-- pharmacists: department_id
ALTER TABLE pharmacists MODIFY COLUMN department_id BIGINT;

-- technicians: department_id
ALTER TABLE technicians MODIFY COLUMN department_id BIGINT;

-- department: head_of_department_id
ALTER TABLE department MODIFY COLUMN head_of_department_id BIGINT;

-- appointments: patient_id, doctor_id
ALTER TABLE appointments MODIFY COLUMN patient_id BIGINT;
ALTER TABLE appointments MODIFY COLUMN doctor_id  BIGINT;

-- beds: patient_id
ALTER TABLE beds MODIFY COLUMN patient_id BIGINT;

-- prescription: patient_id, doctor_id, pharmacist_id
ALTER TABLE prescription MODIFY COLUMN patient_id    BIGINT;
ALTER TABLE prescription MODIFY COLUMN doctor_id     BIGINT;
ALTER TABLE prescription MODIFY COLUMN pharmacist_id BIGINT;

-- prescription_items: medicine_id, prescription_id
ALTER TABLE prescription_items MODIFY COLUMN medicine_id     BIGINT;
ALTER TABLE prescription_items MODIFY COLUMN prescription_id BIGINT;

-- medicine_dispensation: pharmacist_id, prescription_id, patient_id
ALTER TABLE medicine_dispensation MODIFY COLUMN pharmacist_id   BIGINT;
ALTER TABLE medicine_dispensation MODIFY COLUMN prescription_id BIGINT;
ALTER TABLE medicine_dispensation MODIFY COLUMN patient_id      BIGINT;

-- medicine_stock: medicine_id
ALTER TABLE medicine_stock MODIFY COLUMN medicine_id BIGINT;

-- lab_tests: patient_id, doctor_id, technician_id
ALTER TABLE lab_tests MODIFY COLUMN patient_id    BIGINT;
ALTER TABLE lab_tests MODIFY COLUMN doctor_id     BIGINT;
ALTER TABLE lab_tests MODIFY COLUMN technician_id BIGINT;

-- radiology_orders: patient_id, doctor_id, technician_id
ALTER TABLE radiology_orders MODIFY COLUMN patient_id    BIGINT;
ALTER TABLE radiology_orders MODIFY COLUMN doctor_id     BIGINT;
ALTER TABLE radiology_orders MODIFY COLUMN technician_id BIGINT;

-- blood_requests: patient_id, doctor_id
ALTER TABLE blood_requests MODIFY COLUMN patient_id BIGINT;
ALTER TABLE blood_requests MODIFY COLUMN doctor_id  BIGINT;

-- transfer_requests: patient_id, doctor_id, to_hospital_id
ALTER TABLE transfer_requests MODIFY COLUMN patient_id    BIGINT;
ALTER TABLE transfer_requests MODIFY COLUMN doctor_id     BIGINT;
ALTER TABLE transfer_requests MODIFY COLUMN to_hospital_id BIGINT;

-- refresh_tokens: user_id
ALTER TABLE refresh_tokens MODIFY COLUMN user_id BIGINT;

-- ── Re-enable FK checks ───────────────────────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 1;

-- ── Verify — every id column should show 'auto_increment' in EXTRA ────────────
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, EXTRA
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME  = 'id'
ORDER BY TABLE_NAME;
