USE hms_backend;

-- Fix: set all ACCOUNTANT users to Password123 BCrypt hash
-- Hash value: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- Plain text: Password123

UPDATE users
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE role = 'ACCOUNTANT';

-- Fix: ensure every ACCOUNTANT in users has a row in accountants subtable
INSERT IGNORE INTO accountants (accountant_id)
SELECT u.id
FROM users u
LEFT JOIN accountants a ON a.accountant_id = u.id
WHERE u.role = 'ACCOUNTANT'
  AND a.accountant_id IS NULL;

-- Verify
SELECT u.id, u.username, LEFT(u.password, 20) AS hash_prefix, a.accountant_id
FROM users u
LEFT JOIN accountants a ON a.accountant_id = u.id
WHERE u.role = 'ACCOUNTANT';
