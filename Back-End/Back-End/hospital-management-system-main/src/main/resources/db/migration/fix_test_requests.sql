-- ============================================================
-- Fix: test_requests.technician_id FK → references users(id)
-- (Hibernate already generates this correctly via @ManyToOne User,
--  but run this if you have a legacy FK pointing to technicians table)
-- ============================================================

-- Step 1: Drop old FK if it points to technicians table
-- (Only run if the FK exists — check with SHOW CREATE TABLE test_requests first)
-- ALTER TABLE test_requests DROP FOREIGN KEY fk_tr_technician;

-- Step 2: Add correct FK pointing to users(id)
-- ALTER TABLE test_requests
--   ADD CONSTRAINT fk_tr_technician
--   FOREIGN KEY (technician_id) REFERENCES users(id);

-- ============================================================
-- Fix: Reset stale ACKNOWLEDGED requests back to PENDING
-- (Requests stuck in ACKNOWLEDGED with no technician assigned)
-- ============================================================
UPDATE test_requests
SET status = 'PENDING', technician_id = NULL
WHERE status = 'ACKNOWLEDGED'
  AND technician_id IS NULL;

-- ============================================================
-- Fix: Reset ACKNOWLEDGED requests where technician no longer exists
-- ============================================================
UPDATE test_requests tr
SET tr.status = 'PENDING', tr.technician_id = NULL
WHERE tr.status = 'ACKNOWLEDGED'
  AND tr.technician_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = tr.technician_id
  );
