-- ============================================================
-- Fix: medicine.id missing AUTO_INCREMENT
--
-- Error: "Field 'id' doesn't have a default value"
-- Cause: The medicine table was created without AUTO_INCREMENT
--        on the id column. Hibernate's ddl-auto=update does
--        NOT add AUTO_INCREMENT to existing columns.
--
-- Run this once directly on hms_backend database.
-- ============================================================

-- Step 1: Find the current max id to set the correct start value
-- (only needed if rows already exist)
SET @max_id = (SELECT COALESCE(MAX(id), 0) FROM medicine);

-- Step 2: Alter the column to add AUTO_INCREMENT
-- NOTE: PRIMARY KEY must be re-declared alongside AUTO_INCREMENT in MySQL
ALTER TABLE medicine
    MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;

-- Step 3: If rows exist, ensure the counter starts above the current max
-- (MySQL resets AUTO_INCREMENT to MAX(id)+1 automatically on MODIFY,
--  so this is just a safety check)
-- SET @stmt = CONCAT('ALTER TABLE medicine AUTO_INCREMENT = ', @max_id + 1);
-- PREPARE stmt FROM @stmt;
-- EXECUTE stmt;
-- DEALLOCATE PREPARE stmt;

SELECT 'medicine.id AUTO_INCREMENT fixed successfully' AS result;
