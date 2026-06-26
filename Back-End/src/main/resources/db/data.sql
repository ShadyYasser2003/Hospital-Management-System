-- ============================================================
-- HMS Complete Seed Data
-- Generated from entity inspection — all field names verified
-- Passwords are BCrypt of "Password123"
-- Run AFTER schema is created (ddl-auto=create or schema_complete.sql)
-- ============================================================

USE hms_backend;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. SPECIALITY
-- Fields: id, name, description, status
-- ============================================================
INSERT INTO speciality (id, name, description, status) VALUES
(1,  'Cardiology',        'Diagnosis and treatment of heart diseases',             'active'),
(2,  'Neurology',         'Brain, spinal cord and nervous system disorders',       'active'),
(3,  'Orthopedics',       'Musculoskeletal system — bones, joints, ligaments',     'active'),
(4,  'Pediatrics',        'Medical care for infants, children and adolescents',    'active'),
(5,  'Oncology',          'Cancer diagnosis, treatment and follow-up',             'active'),
(6,  'Radiology',         'Medical imaging interpretation and diagnostics',        'active'),
(7,  'General Surgery',   'Operative management of abdominal and other conditions','active'),
(8,  'Emergency Medicine','Immediate care for acute illness and trauma',           'active'),
(9,  'Dermatology',       'Skin, hair and nail conditions',                        'active'),
(10, 'Psychiatry',        'Mental health disorders and behavioral medicine',       'active');

-- ============================================================
-- 2. DEPARTMENT
-- Fields: id, name, description, location, budget, is_active, total_beds, available_beds
-- ============================================================
INSERT INTO department (id, name, description, location, budget, is_active, total_beds, available_beds) VALUES
(1,  'Cardiology',        'Heart and cardiovascular care unit',       'Building A, Floor 2', '500000', 1, 20, 8),
(2,  'Neurology',         'Brain and nervous system unit',            'Building A, Floor 3', '450000', 1, 15, 5),
(3,  'Orthopedics',       'Bone and joint treatment unit',            'Building B, Floor 1', '400000', 1, 18, 7),
(4,  'Pediatrics',        'Children healthcare unit',                 'Building C, Floor 1', '350000', 1, 25, 12),
(5,  'Oncology',          'Cancer treatment and chemotherapy unit',   'Building D, Floor 2', '600000', 1, 20, 6),
(6,  'Emergency',         '24/7 emergency care unit',                 'Building A, Floor 1', '700000', 1, 30, 10),
(7,  'Radiology',         'Medical imaging and diagnostics unit',     'Building B, Floor 2', '300000', 1, 5,  5),
(8,  'General Surgery',   'Surgical operations unit',                 'Building C, Floor 2', '550000', 1, 22, 8),
(9,  'Pharmacy',          'Medicine dispensing and management',       'Building A, Ground',  '200000', 1, 0,  0),
(10, 'Laboratory',        'Clinical laboratory and pathology tests',  'Building B, Ground',  '250000', 1, 0,  0);

-- ============================================================
-- 3. EXTERNAL HOSPITALS
-- Fields: id, name, email, phone, address, is_active, created_at
-- ============================================================
INSERT INTO external_hospitals (id, name, email, phone, address, is_active, created_at) VALUES
(1, 'Cairo University Hospital',    'referral@cuh.edu.eg',        '+20223640000', 'Giza, Cairo, Egypt',          1, '2024-01-10 08:00:00'),
(2, 'Ain Shams University Hospital','info@ainshams-hosp.edu.eg',  '+20224821000', 'Abbassia, Cairo, Egypt',       1, '2024-01-10 08:00:00'),
(3, 'Alexandria General Hospital',  'contact@alexgeneralhsp.eg',  '+20345671234', 'Smouha, Alexandria, Egypt',    1, '2024-01-10 08:00:00'),
(4, 'Assiut University Hospital',   'transfer@assiuthosp.edu.eg', '+20882080000', 'Assiut, Upper Egypt',          1, '2024-01-10 08:00:00'),
(5, 'Mansoura Specialized Hospital','info@mansouraspecialized.eg','+20502360000', 'Mansoura, Dakahlia, Egypt',    1, '2024-01-10 08:00:00');

-- ============================================================
-- 4. USERS — base table (JOINED inheritance)
-- Passwords = BCrypt("Password123")
-- Fields: id, username, national_id, password, name, date_of_birth,
--         email, phone, address, role, avatar, user_status, created_at
-- ============================================================
INSERT INTO users (id, username, national_id, password, name, date_of_birth, email, phone, address, role, avatar, user_status, created_at) VALUES
-- Admins (1-2)
(1,  'admin1',        '10000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ahmed Hassan',        '1980-05-15', 'ahmed.hassan@medicore.eg',     '+201001234567', '10 Tahrir Square, Cairo',           'ADMIN',       NULL, 'ACTIVE', '2024-01-01 08:00:00'),
(2,  'admin2',        '10000000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sara Mahmoud',        '1985-09-20', 'sara.mahmoud@medicore.eg',     '+201009876543', '25 Heliopolis St, Cairo',           'ADMIN',       NULL, 'ACTIVE', '2024-01-01 08:00:00'),
-- Doctors (3-10)
(3,  'dr.omar',       '20000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Omar Khaled',     '1975-03-10', 'omar.khaled@medicore.eg',      '+201011111111', '5 Corniche El Nil, Cairo',          'DOCTOR',      NULL, 'ACTIVE', '2024-01-05 08:00:00'),
(4,  'dr.nadia',      '20000000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Nadia Saleh',     '1978-07-22', 'nadia.saleh@medicore.eg',      '+201022222222', '12 Zamalek Island, Cairo',          'DOCTOR',      NULL, 'ACTIVE', '2024-01-05 08:00:00'),
(5,  'dr.tarek',      '20000000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Tarek Mostafa',   '1972-11-05', 'tarek.mostafa@medicore.eg',    '+201033333333', '7 Mohandessin, Giza',               'DOCTOR',      NULL, 'ACTIVE', '2024-01-05 08:00:00'),
(6,  'dr.layla',      '20000000004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Layla Ibrahim',   '1980-02-14', 'layla.ibrahim@medicore.eg',    '+201044444444', '3 Nasr City, Cairo',                'DOCTOR',      NULL, 'ACTIVE', '2024-01-05 08:00:00'),
(7,  'dr.youssef',    '20000000005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Youssef Adel',    '1976-08-30', 'youssef.adel@medicore.eg',     '+201055555555', '18 Maadi, Cairo',                   'DOCTOR',      NULL, 'ACTIVE', '2024-01-05 08:00:00'),
(8,  'dr.hana',       '20000000006', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Hana Fouad',      '1983-04-18', 'hana.fouad@medicore.eg',       '+201066666666', '22 Dokki, Giza',                    'DOCTOR',      NULL, 'ACTIVE', '2024-01-05 08:00:00'),
(9,  'dr.karim',      '20000000007', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Karim Nasser',    '1971-12-25', 'karim.nasser@medicore.eg',     '+201077777777', '9 Garden City, Cairo',              'DOCTOR',      NULL, 'ACTIVE', '2024-01-05 08:00:00'),
(10, 'dr.rania',      '20000000008', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Rania Gamal',     '1979-06-07', 'rania.gamal@medicore.eg',      '+201088888888', '14 Helwan, Cairo',                  'DOCTOR',      NULL, 'ACTIVE', '2024-01-05 08:00:00'),
-- Nurses (11-16)
(11, 'nurse.mona',    '30000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mona Sayed',          '1990-01-12', 'mona.sayed@medicore.eg',       '+201099999991', '3 Shubra, Cairo',                   'NURSE',       NULL, 'ACTIVE', '2024-01-08 08:00:00'),
(12, 'nurse.dina',    '30000000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dina Wahid',          '1992-05-20', 'dina.wahid@medicore.eg',       '+201099999992', '8 Ain Shams, Cairo',                'NURSE',       NULL, 'ACTIVE', '2024-01-08 08:00:00'),
(13, 'nurse.samia',   '30000000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Samia Hassan',        '1988-09-15', 'samia.hassan@medicore.eg',     '+201099999993', '15 Imbaba, Giza',                   'NURSE',       NULL, 'ACTIVE', '2024-01-08 08:00:00'),
(14, 'nurse.eman',    '30000000004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Eman Fathy',          '1993-03-28', 'eman.fathy@medicore.eg',       '+201099999994', '2 Giza Square, Giza',               'NURSE',       NULL, 'ACTIVE', '2024-01-08 08:00:00'),
(15, 'nurse.noha',    '30000000005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Noha Kamal',          '1991-11-09', 'noha.kamal@medicore.eg',       '+201099999995', '6 Shoubra El Kheima',               'NURSE',       NULL, 'ACTIVE', '2024-01-08 08:00:00'),
(16, 'nurse.amal',    '30000000006', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Amal Youssef',        '1987-07-04', 'amal.youssef@medicore.eg',     '+201099999996', '11 El Mataria, Cairo',              'NURSE',       NULL, 'ACTIVE', '2024-01-08 08:00:00'),
-- Pharmacists (17-19)
(17, 'pharm.hassan',  '40000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hassan Ali',          '1985-06-11', 'hassan.ali@medicore.eg',       '+201055500001', '4 Ramsis St, Cairo',                'PHARMACIST',  NULL, 'ACTIVE', '2024-01-09 08:00:00'),
(18, 'pharm.mai',     '40000000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mai Sameh',           '1989-10-25', 'mai.sameh@medicore.eg',        '+201055500002', '7 Agouza, Giza',                    'PHARMACIST',  NULL, 'ACTIVE', '2024-01-09 08:00:00'),
(19, 'pharm.adel',    '40000000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Adel Mansour',        '1982-04-03', 'adel.mansour@medicore.eg',     '+201055500003', '19 Nasr Road, Cairo',               'PHARMACIST',  NULL, 'ACTIVE', '2024-01-09 08:00:00'),
-- Accountants (20-21)
(20, 'acc.sherif',    '50000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sherif Zaki',         '1983-08-17', 'sherif.zaki@medicore.eg',      '+201044400001', '33 Mokatam, Cairo',                 'ACCOUNTANT',  NULL, 'ACTIVE', '2024-01-09 08:00:00'),
(21, 'acc.ola',       '50000000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ola Ramadan',         '1987-02-28', 'ola.ramadan@medicore.eg',      '+201044400002', '5 Fifth Settlement, Cairo',         'ACCOUNTANT',  NULL, 'ACTIVE', '2024-01-09 08:00:00'),
-- Technicians (22-25)
(22, 'tech.ibrahim',  '60000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ibrahim Shaker',      '1986-07-19', 'ibrahim.shaker@medicore.eg',   '+201033300001', '20 Hadayek El Maadi, Cairo',        'TECHNICIAN',  NULL, 'ACTIVE', '2024-01-10 08:00:00'),
(23, 'tech.amira',    '60000000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Amira Nabil',         '1990-12-08', 'amira.nabil@medicore.eg',      '+201033300002', '14 Salam City, Cairo',              'TECHNICIAN',  NULL, 'ACTIVE', '2024-01-10 08:00:00'),
(24, 'tech.wael',     '60000000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Wael Saad',           '1984-03-22', 'wael.saad@medicore.eg',        '+201033300003', '9 Badr City, Cairo',                'TECHNICIAN',  NULL, 'ACTIVE', '2024-01-10 08:00:00'),
(25, 'tech.fatma',    '60000000004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Fatma Lotfy',         '1992-09-14', 'fatma.lotfy@medicore.eg',      '+201033300004', '6 Obour City, Cairo',               'TECHNICIAN',  NULL, 'ACTIVE', '2024-01-10 08:00:00'),
-- Receptionists (26-28)
(26, 'rec.mariam',    '70000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mariam Lotfy',        '1994-01-30', 'mariam.lotfy@medicore.eg',     '+201022200001', '12 Rehab City, Cairo',              'RECEPTIONIST',NULL, 'ACTIVE', '2024-01-10 08:00:00'),
(27, 'rec.tasneem',   '70000000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tasneem Ali',         '1995-06-15', 'tasneem.ali@medicore.eg',      '+201022200002', '3 Katameya Heights, Cairo',         'RECEPTIONIST',NULL, 'ACTIVE', '2024-01-10 08:00:00'),
(28, 'rec.ahmed',     '70000000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ahmed Samir',         '1993-11-20', 'ahmed.samir@medicore.eg',      '+201022200003', '7 New Cairo, Cairo',                'RECEPTIONIST',NULL, 'ACTIVE', '2024-01-10 08:00:00'),
-- Patients (29-40)
(29, 'pat.ali',       '80000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ali Mohamed',         '1965-04-12', 'ali.mohamed@gmail.com',        '+201012345601', '1 El Haram, Giza',                  'PATIENT',     NULL, 'ACTIVE', '2024-02-01 09:00:00'),
(30, 'pat.fatima',    '80000000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Fatima Ahmed',        '1978-08-25', 'fatima.ahmed@gmail.com',       '+201012345602', '5 Moqattam, Cairo',                 'PATIENT',     NULL, 'ACTIVE', '2024-02-01 09:00:00'),
(31, 'pat.khaled',    '80000000003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Khaled Ibrahim',      '1955-12-30', 'khaled.ibrahim@gmail.com',     '+201012345603', '9 Heliopolis, Cairo',               'PATIENT',     NULL, 'ACTIVE', '2024-02-02 09:00:00'),
(32, 'pat.nour',      '80000000004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nour Hassan',         '1990-03-07', 'nour.hassan@gmail.com',        '+201012345604', '13 Maadi, Cairo',                   'PATIENT',     NULL, 'ACTIVE', '2024-02-02 09:00:00'),
(33, 'pat.mostafa',   '80000000005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mostafa Saad',        '1982-07-19', 'mostafa.saad@gmail.com',       '+201012345605', '2 Zahraa El Maadi, Cairo',          'PATIENT',     NULL, 'ACTIVE', '2024-02-03 09:00:00'),
(34, 'pat.salma',     '80000000006', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Salma Youssef',       '1995-11-14', 'salma.youssef@gmail.com',      '+201012345606', '6 El Obour, Cairo',                 'PATIENT',     NULL, 'ACTIVE', '2024-02-03 09:00:00'),
(35, 'pat.hassan2',   '80000000007', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hassan Omar',         '1970-06-01', 'hassan.omar@gmail.com',        '+201012345607', '10 Shubra, Cairo',                  'PATIENT',     NULL, 'ACTIVE', '2024-02-04 09:00:00'),
(36, 'pat.dalia',     '80000000008', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dalia Mahmoud',       '1988-02-17', 'dalia.mahmoud@gmail.com',      '+201012345608', '4 Rehab City, Cairo',               'PATIENT',     NULL, 'ACTIVE', '2024-02-04 09:00:00'),
(37, 'pat.sherif2',   '80000000009', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sherif Naguib',       '1960-09-05', 'sherif.naguib@gmail.com',      '+201012345609', '17 Ain Shams, Cairo',               'PATIENT',     NULL, 'ACTIVE', '2024-02-05 09:00:00'),
(38, 'pat.yasmine',   '80000000010', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Yasmine Khalil',      '2000-05-22', 'yasmine.khalil@gmail.com',     '+201012345610', '8 October City, Giza',              'PATIENT',     NULL, 'ACTIVE', '2024-02-05 09:00:00'),
(39, 'pat.amr',       '80000000011', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Amr Wagdy',           '1975-01-09', 'amr.wagdy@gmail.com',          '+201012345611', '3 Asyut St, Cairo',                 'PATIENT',     NULL, 'ACTIVE', '2024-02-06 09:00:00'),
(40, 'pat.heba',      '80000000012', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Heba Ramzy',          '1993-10-31', 'heba.ramzy@gmail.com',         '+201012345612', '21 Zamalek, Cairo',                 'PATIENT',     NULL, 'ACTIVE', '2024-02-06 09:00:00');

INSERT INTO users (id, username, national_id, password, name, date_of_birth, email, phone, address, role, avatar, user_status, created_at) VALUES
(50, 'acc.omar', '50000000003', '$2a$10$N.sxBbKDGB/8rjLMkFCVOeHEtDTMkHFzLHBE5DhElwNsZQxPWkbTK', 'Omar Fathy', '1988-04-10', 'omar.fathy@medicore.eg', '+201044400003', '15 Nasr City, Cairo', 'ACCOUNTANT', NULL, 'ACTIVE', '2024-01-09 08:00:00');

INSERT INTO users (id, username, national_id, password, name, date_of_birth, email, phone, address, role, avatar, user_status, created_at) VALUES
(51, 'acc.layla', '50000000004', '$2a$10$N.sxBbKDGB/8rjLMkFCVOeHEtDTMkHFzLHBE5DhElwNsZQxPWkbTK', 'Layla Hassan', '1990-07-15', 'layla.hassan@medicore.eg', '+201044400004', '8 Mohandessin, Giza', 'ACCOUNTANT', NULL, 'ACTIVE', '2024-01-09 08:00:00');

-- User 2
INSERT INTO users (id, username, national_id, password, name, date_of_birth, email, phone, address, role, avatar, user_status, created_at) VALUES
(52, 'acc.khaled', '50000000005', '$2a$10$N.sxBbKDGB/8rjLMkFCVOeHEtDTMkHFzLHBE5DhElwNsZQxPWkbTK', 'Khaled Mostafa', '1985-03-22', 'khaled.mostafa@medicore.eg', '+201044400005', '3 Heliopolis, Cairo', 'ACCOUNTANT', NULL, 'ACTIVE', '2024-01-09 08:00:00');


-- ============================================================
-- 5. ADMIN subtable
-- Fields: admin_id (FK → users.id)
-- ============================================================
INSERT INTO admin (admin_id) VALUES (1), (2);

-- ============================================================
-- 6. DOCTORS subtable
-- Fields: doctor_id, license_number, specialization, qualification,
--         medical_school, year_of_graduation, years_of_experience,
--         hire_date, employment_status, shift, department_id, speciality_id
-- ============================================================
INSERT INTO doctors (doctor_id, license_number, specialization, qualification, medical_school, year_of_graduation, years_of_experience, hire_date, employment_status, shift, department_id, speciality_id) VALUES
(3,  'MD-EG-001', 'Cardiologist',         'MD, FESC',    'Cairo University',      2000, 24, '2010-03-01', 'FULL_TIME', 'DAY',     1,  1),
(4,  'MD-EG-002', 'Neurologist',          'MD, PhD',     'Ain Shams University',  2003, 21, '2012-06-15', 'FULL_TIME', 'DAY',     2,  2),
(5,  'MD-EG-003', 'Orthopedic Surgeon',   'MD, FRCS',    'Alexandria University', 1997, 27, '2008-01-10', 'FULL_TIME', 'DAY',     3,  3),
(6,  'MD-EG-004', 'Pediatrician',         'MD, DCH',     'Cairo University',      2005, 19, '2013-09-01', 'FULL_TIME', 'DAY',     4,  4),
(7,  'MD-EG-005', 'Oncologist',           'MD, FRCR',    'Mansoura University',   1999, 25, '2009-04-20', 'FULL_TIME', 'NIGHT',   5,  5),
(8,  'MD-EG-006', 'Radiologist',          'MD, FRCR',    'Assiut University',     2008, 16, '2015-02-01', 'FULL_TIME', 'DAY',     7,  6),
(9,  'MD-EG-007', 'General Surgeon',      'MD, FRCS',    'Cairo University',      1996, 28, '2007-11-05', 'FULL_TIME', 'ROTATION',8,  7),
(10, 'MD-EG-008', 'Emergency Physician',  'MD, FCEM',    'Ain Shams University',  2004, 20, '2011-07-15', 'FULL_TIME', 'ROTATION',6,  8);

-- ============================================================
-- 7. NURSES subtable
-- Fields: nurse_id, license_number, specialization, years_of_experience,
--         hire_date, employment_status, shift, patient_load, department_id, speciality_id
-- ============================================================
INSERT INTO nurses (nurse_id, license_number, specialization, years_of_experience, hire_date, employment_status, shift, patient_load, department_id, speciality_id) VALUES
(11, 'RN-EG-001', 'ICU',           8,  '2016-03-01', 'FULL_TIME', 'DAY',     6,  1, NULL),
(12, 'RN-EG-002', 'Pediatrics',    6,  '2018-07-15', 'FULL_TIME', 'NIGHT',   5,  4, NULL),
(13, 'RN-EG-003', 'Emergency',     10, '2014-01-10', 'FULL_TIME', 'ROTATION',7,  6, NULL),
(14, 'RN-EG-004', 'General',       5,  '2019-05-20', 'FULL_TIME', 'DAY',     6,  3, NULL),
(15, 'RN-EG-005', 'Oncology',      7,  '2017-11-01', 'FULL_TIME', 'NIGHT',   5,  5, NULL),
(16, 'RN-EG-006', 'Cardiology',    9,  '2015-08-01', 'FULL_TIME', 'DAY',     4,  1, NULL);

-- ============================================================
-- 8. PHARMACISTS subtable
-- Fields: pharmacist_id, license_number, license_expiry_date, shift, department_id
-- ============================================================
INSERT INTO pharmacists (pharmacist_id, license_number, license_expiry_date, shift, department_id) VALUES
(17, 'PH-EG-001', '2026-12-31', 'DAY',     9),
(18, 'PH-EG-002', '2027-06-30', 'NIGHT',   9),
(19, 'PH-EG-003', '2025-09-30', 'ROTATION',9);

-- ============================================================
-- 9. ACCOUNTANTS subtable (no extra fields)
-- ============================================================
INSERT INTO accountants (accountant_id) VALUES (20), (21);

-- ============================================================
-- 10. TECHNICIANS subtable
-- Fields: tech_id, license_number, specialization, years_of_experience,
--         hire_date, employment_status, shift, certifications, department_id
-- ============================================================
INSERT INTO technicians (tech_id, license_number, specialization, years_of_experience, hire_date, employment_status, shift, certifications, department_id) VALUES
(22, 'TL-EG-001', 'LAB',       8,  '2016-04-01', 'FULL_TIME', 'DAY',     'ASCP, CLS',     10),
(23, 'TL-EG-002', 'RADIOLOGY', 6,  '2018-09-01', 'FULL_TIME', 'DAY',     'ARRT, CRT',     7),
(24, 'TL-EG-003', 'LAB',       10, '2014-02-01', 'FULL_TIME', 'NIGHT',   'ASCP',          10),
(25, 'TL-EG-004', 'RADIOLOGY', 4,  '2020-01-15', 'FULL_TIME', 'ROTATION','ARRT',          7);

-- ============================================================
-- 11. RECEPTIONISTS subtable
-- Fields: receptionist_id, shift, speciality_area, hipaa_training_date,
--         customer_service_training, employment_status, department_id
-- ============================================================
INSERT INTO receptionists (receptionist_id, shift, speciality_area, hipaa_training_date, customer_service_training, employment_status, department_id) VALUES
(26, 'DAY',     'OUT_PATIENT', '2023-01-15', '2023-02-10', 'FULL_TIME', 1),
(27, 'NIGHT',   'IN_PATIENT',  '2023-03-20', '2023-04-05', 'FULL_TIME', 6),
(28, 'ROTATION','OUT_PATIENT', '2023-05-10', '2023-06-01', 'FULL_TIME', 4);

-- ============================================================
-- 12. PATIENTS subtable
-- Fields: patient_id, gender, blood_type, emergency_contact,
--         insurance_provider, insurance_number, allergies, medical_history,
--         diagnosis, notes, patient_status, blood_pressure, temperature,
--         pulse, weight, height, vitals_last_updated, created_at
-- ============================================================
INSERT INTO patients (patient_id, gender, blood_type, emergency_contact, insurance_provider, insurance_number, allergies, medical_history, diagnosis, notes, patient_status, blood_pressure, temperature, pulse, weight, height, vitals_last_updated, created_at) VALUES
(29, 'MALE',   'A+',  '+201098765001', 'Misr Insurance',    'MI-001-2024', 'Penicillin',             'Hypertension since 2010',               'Essential Hypertension',            NULL,                   'ACTIVE',    '140/90', '37.0', '80',  '85', '175', '2024-06-01 10:00:00', '2024-02-01 09:00:00'),
(30, 'FEMALE', 'O-',  '+201098765002', 'AXA Insurance',     'AXA-002-2024','None',                   'Asthma since childhood',                'Bronchial Asthma',                  'Requires nebulizer',   'ACTIVE',    '120/80', '36.8', '75',  '62', '163', '2024-06-02 10:00:00', '2024-02-01 09:00:00'),
(31, 'MALE',   'B+',  '+201098765003', NULL,                NULL,          'Aspirin, Ibuprofen',     'Diabetes Type 2 since 2005, Hypertension','Diabetes Mellitus Type 2',        'On insulin therapy',   'ADMITTED',  '150/95', '37.2', '88',  '95', '172', '2024-06-03 10:00:00', '2024-02-02 09:00:00'),
(32, 'FEMALE', 'AB+', '+201098765004', 'Allianz Egypt',     'AL-004-2024', 'Sulfa drugs',            'Migraine since 2015',                   'Chronic Migraine',                  NULL,                   'ACTIVE',    '110/70', '36.6', '72',  '55', '160', '2024-06-04 10:00:00', '2024-02-02 09:00:00'),
(33, 'MALE',   'O+',  '+201098765005', 'Wethaq Takaful',    'WT-005-2024', 'None',                   'Chronic back pain since 2018',          'Lumbar Disc Herniation',            NULL,                   'ACTIVE',    '130/85', '37.1', '76',  '80', '178', '2024-06-05 10:00:00', '2024-02-03 09:00:00'),
(34, 'FEMALE', 'A-',  '+201098765006', 'Misr Insurance',    'MI-006-2024', 'Latex',                  'No chronic illnesses',                  'Acute Appendicitis — post-op',      'Recovering well',      'ADMITTED',  '118/75', '37.4', '82',  '58', '165', '2024-06-06 10:00:00', '2024-02-03 09:00:00'),
(35, 'MALE',   'B-',  '+201098765007', NULL,                NULL,          'None',                   'Hypertension, Coronary artery disease', 'Ischemic Heart Disease',            NULL,                   'ACTIVE',    '160/100','37.0', '90',  '90', '170', '2024-06-07 10:00:00', '2024-02-04 09:00:00'),
(36, 'FEMALE', 'AB-', '+201098765008', 'AXA Insurance',     'AXA-008-2024','Codeine',                'Anxiety disorder since 2020',           'Generalized Anxiety Disorder',      NULL,                   'ACTIVE',    '115/72', '36.7', '74',  '57', '162', '2024-06-08 10:00:00', '2024-02-04 09:00:00'),
(37, 'MALE',   'O+',  '+201098765009', NULL,                NULL,          'None',                   'Colorectal cancer diagnosed 2023',      'Colorectal Cancer Stage II',        'Chemotherapy cycle 3', 'ADMITTED',  '125/80', '37.3', '78',  '70', '168', '2024-06-09 10:00:00', '2024-02-05 09:00:00'),
(38, 'FEMALE', 'A+',  '+201098765010', 'Allianz Egypt',     'AL-010-2024', 'NSAIDs',                 'No significant history',                'Acute UTI',                         NULL,                   'ACTIVE',    '112/70', '37.5', '70',  '52', '158', '2024-06-10 10:00:00', '2024-02-05 09:00:00'),
(39, 'MALE',   'O-',  '+201098765011', NULL,                NULL,          'None',                   'Obesity, Sleep apnea',                  'Metabolic Syndrome',                NULL,                   'ACTIVE',    '145/92', '37.1', '85',  '110','180', '2024-06-11 10:00:00', '2024-02-06 09:00:00'),
(40, 'FEMALE', 'B+',  '+201098765012', 'Misr Insurance',    'MI-012-2024', 'Shellfish allergy',      'Thyroid disease since 2019',            'Hypothyroidism',                    'On levothyroxine',     'ACTIVE',    '116/74', '36.8', '71',  '60', '161', '2024-06-12 10:00:00', '2024-02-06 09:00:00');

-- ============================================================
-- 13. APPOINTMENTS
-- Table: appointments
-- Fields: id, patient_id, patient_name, doctor_id, doctor_name,
--         department, appointment_date, appointment_time, type, status, notes, created_at
-- ============================================================
INSERT INTO appointments (id, patient_id, patient_name, doctor_id, doctor_name, department, appointment_date, appointment_time, type, status, notes, created_at) VALUES
(1,  29, 'Ali Mohamed',    3,  'Dr. Omar Khaled',   'Cardiology',   '2024-06-15', '09:00:00', 'CONSULTATION', 'CONFIRMED',  'First visit for blood pressure check',          '2024-06-10 08:00:00'),
(2,  30, 'Fatima Ahmed',   6,  'Dr. Hana Fouad',    'Pediatrics',   '2024-06-15', '10:30:00', 'FOLLOW_UP',    'CONFIRMED',  'Asthma follow-up',                              '2024-06-10 09:00:00'),
(3,  31, 'Khaled Ibrahim', 3,  'Dr. Omar Khaled',   'Cardiology',   '2024-06-16', '11:00:00', 'CONSULTATION', 'PENDING',    'Chest pain evaluation',                         '2024-06-11 08:00:00'),
(4,  32, 'Nour Hassan',    4,  'Dr. Nadia Saleh',   'Neurology',    '2024-06-16', '14:00:00', 'CONSULTATION', 'CONFIRMED',  'Migraine management',                           '2024-06-11 09:00:00'),
(5,  33, 'Mostafa Saad',   5,  'Dr. Tarek Mostafa', 'Orthopedics',  '2024-06-17', '09:30:00', 'FOLLOW_UP',    'CONFIRMED',  'Post-MRI review',                               '2024-06-12 08:00:00'),
(6,  35, 'Hassan Omar',    3,  'Dr. Omar Khaled',   'Cardiology',   '2024-06-17', '11:30:00', 'FOLLOW_UP',    'COMPLETED',  'Cardiac stress test results review',            '2024-06-12 09:00:00'),
(7,  36, 'Dalia Mahmoud',  4,  'Dr. Nadia Saleh',   'Neurology',    '2024-06-18', '10:00:00', 'CONSULTATION', 'CONFIRMED',  'Anxiety and headache evaluation',               '2024-06-13 08:00:00'),
(8,  37, 'Sherif Naguib',  7,  'Dr. Youssef Adel',  'Oncology',     '2024-06-18', '13:00:00', 'FOLLOW_UP',    'CONFIRMED',  'Chemotherapy session 4 planning',               '2024-06-13 09:00:00'),
(9,  38, 'Yasmine Khalil', 10, 'Dr. Rania Gamal',   'Emergency',    '2024-06-14', '08:00:00', 'EMERGENCY',    'COMPLETED',  'UTI with fever — emergency presentation',       '2024-06-14 07:30:00'),
(10, 39, 'Amr Wagdy',      3,  'Dr. Omar Khaled',   'Cardiology',   '2024-06-19', '09:00:00', 'CONSULTATION', 'PENDING',    'Metabolic syndrome cardiac risk assessment',    '2024-06-14 10:00:00'),
(11, 40, 'Heba Ramzy',     4,  'Dr. Nadia Saleh',   'Neurology',    '2024-06-19', '11:00:00', 'FOLLOW_UP',    'PENDING',    'Thyroid-related neurological symptoms',         '2024-06-14 11:00:00'),
(12, 29, 'Ali Mohamed',    3,  'Dr. Omar Khaled',   'Cardiology',   '2024-05-10', '10:00:00', 'CONSULTATION', 'COMPLETED',  'Hypertension initial assessment',               '2024-05-05 08:00:00');

-- ============================================================
-- 14. BEDS
-- Table: beds
-- Fields: id, bed_number, ward_name, status, patient_id, patient_name, created_at
-- ============================================================
INSERT INTO beds (id, bed_number, ward_name, status, patient_id, patient_name, created_at) VALUES
(1,  'CARD-101', 'Cardiology Ward A',    'OCCUPIED',    31,  'Khaled Ibrahim', '2024-01-15 08:00:00'),
(2,  'CARD-102', 'Cardiology Ward A',    'AVAILABLE',   NULL, NULL,            '2024-01-15 08:00:00'),
(3,  'CARD-103', 'Cardiology Ward A',    'MAINTENANCE', NULL, NULL,            '2024-01-15 08:00:00'),
(4,  'NEURO-101','Neurology Ward',       'AVAILABLE',   NULL, NULL,            '2024-01-15 08:00:00'),
(5,  'NEURO-102','Neurology Ward',       'AVAILABLE',   NULL, NULL,            '2024-01-15 08:00:00'),
(6,  'ORTHO-101','Orthopedics Ward',     'OCCUPIED',    34,  'Salma Youssef',  '2024-01-15 08:00:00'),
(7,  'ORTHO-102','Orthopedics Ward',     'AVAILABLE',   NULL, NULL,            '2024-01-15 08:00:00'),
(8,  'ONCO-101', 'Oncology Ward',        'OCCUPIED',    37,  'Sherif Naguib',  '2024-01-15 08:00:00'),
(9,  'ONCO-102', 'Oncology Ward',        'AVAILABLE',   NULL, NULL,            '2024-01-15 08:00:00'),
(10, 'ICU-001',  'Intensive Care Unit',  'AVAILABLE',   NULL, NULL,            '2024-01-15 08:00:00'),
(11, 'ICU-002',  'Intensive Care Unit',  'AVAILABLE',   NULL, NULL,            '2024-01-15 08:00:00'),
(12, 'SURG-101', 'Surgery Ward',         'AVAILABLE',   NULL, NULL,            '2024-01-15 08:00:00');

-- ============================================================
-- 15. MEDICINE CATEGORY
-- Table: medicine_category
-- Fields: id, name, description
-- ============================================================
INSERT INTO medicine_category (id, name, description) VALUES
(1, 'Cardiovascular',     'Medications for heart and blood vessel conditions'),
(2, 'Antibiotics',        'Antimicrobial agents for bacterial infections'),
(3, 'Analgesics',         'Pain relief and anti-inflammatory medications'),
(4, 'Antidiabetics',      'Blood glucose control medications'),
(5, 'Respiratory',        'Medications for asthma, COPD and lung conditions'),
(6, 'Gastrointestinal',   'Medications for digestive system disorders'),
(7, 'Neurological',       'Medications for nervous system and psychiatric disorders'),
(8, 'Oncology',           'Chemotherapy and supportive cancer medications'),
(9, 'Endocrine',          'Hormone replacement and endocrine disorder medications'),
(10,'Vitamins & Supplements','Nutritional supplements and vitamins');

-- ============================================================
-- 16. MEDICINE
-- Table: medicine (Hibernate creates table named "medicine")
-- Fields: id, name, generic_name, status, prescription_required,
--         description, side_effects, created_at
-- ============================================================
INSERT INTO medicine (id, name, generic_name, status, prescription_required, description, side_effects, created_at) VALUES
(1,  'Concor 5mg',        'Bisoprolol',       'IN_STOCK', 1, 'Beta-blocker for hypertension and heart failure',    'Fatigue, dizziness, bradycardia',             '2024-01-01'),
(2,  'Aspirin 100mg',     'Acetylsalicylic acid','IN_STOCK',0,'Antiplatelet and mild analgesic',                   'GI upset, bleeding risk',                     '2024-01-01'),
(3,  'Amoxil 500mg',      'Amoxicillin',      'IN_STOCK', 1, 'Broad-spectrum penicillin antibiotic',              'Rash, diarrhea, allergic reaction',            '2024-01-01'),
(4,  'Glucophage 500mg',  'Metformin',        'IN_STOCK', 1, 'First-line oral antidiabetic',                      'GI disturbance, lactic acidosis (rare)',       '2024-01-01'),
(5,  'Ventolin 100mcg',   'Salbutamol',       'IN_STOCK', 0, 'Short-acting bronchodilator for asthma',            'Tremor, palpitations, tachycardia',            '2024-01-01'),
(6,  'Nexium 40mg',       'Esomeprazole',     'IN_STOCK', 1, 'Proton pump inhibitor for GERD and ulcers',         'Headache, nausea, diarrhea',                   '2024-01-01'),
(7,  'Brufen 400mg',      'Ibuprofen',        'IN_STOCK', 0, 'NSAID for pain and inflammation',                   'GI bleeding, renal impairment',               '2024-01-01'),
(8,  'Panadol 500mg',     'Paracetamol',      'IN_STOCK', 0, 'Analgesic and antipyretic',                         'Hepatotoxicity in overdose',                  '2024-01-01'),
(9,  'Lantus 100IU/mL',   'Insulin Glargine', 'IN_STOCK', 1, 'Long-acting basal insulin for diabetes',           'Hypoglycemia, injection site reactions',       '2024-01-01'),
(10, 'Augmentin 625mg',   'Amoxicillin/Clavulanate','IN_STOCK',1,'Beta-lactam combination antibiotic',            'Diarrhea, rash, hepatotoxicity',              '2024-01-01'),
(11, 'Crestor 10mg',      'Rosuvastatin',     'IN_STOCK', 1, 'Statin for hypercholesterolemia',                   'Myopathy, hepatotoxicity',                    '2024-01-01'),
(12, 'Synthroid 100mcg',  'Levothyroxine',    'IN_STOCK', 1, 'Thyroid hormone replacement',                       'Palpitations, insomnia if over-dosed',        '2024-01-01'),
(13, 'Cipro 500mg',       'Ciprofloxacin',    'IN_STOCK', 1, 'Fluoroquinolone antibiotic',                        'Tendon rupture, QT prolongation',             '2024-01-01'),
(14, 'Aldactone 25mg',    'Spironolactone',   'LOW_STOCK',1, 'Potassium-sparing diuretic',                        'Hyperkalemia, gynecomastia',                  '2024-01-01'),
(15, 'Zantac 150mg',      'Ranitidine',       'IN_STOCK', 0, 'H2 blocker for peptic ulcer and GERD',             'Headache, constipation',                      '2024-01-01');

-- ============================================================
-- 17. MEDICINE STOCK
-- Table: medicine_stock (Hibernate: "medicine_stock")
-- Fields: id, manufacturer, re_order_level, selling_price, unit_purchase,
--         medicine_form, expiry_date, storage_location, dosage, package_size,
--         purchase_quantity, current_quantity, medicine_id
-- ============================================================
INSERT INTO medicine_stock (id, manufacturer, re_order_level, selling_price, unit_purchase, medicine_form, expiry_date, storage_location, dosage, package_size, purchase_quantity, current_quantity, medicine_id) VALUES
(1,  'Merck Egypt',           50,  12.50,  8.00,  'Tablets',  '2026-06-30', 'Aisle A, Shelf 1', '5mg once daily',     'Box of 28 tablets', 200, 180, 1),
(2,  'Bayer Egypt',           100, 3.50,   2.00,  'Tablets',  '2026-12-31', 'Aisle A, Shelf 2', '100mg once daily',   'Box of 30 tablets', 500, 450, 2),
(3,  'GlaxoSmithKline Egypt', 80,  18.00,  12.00, 'Capsules', '2025-09-30', 'Aisle B, Shelf 1', '500mg 3x daily',     'Box of 21 capsules',300, 270, 3),
(4,  'Merck Serono',          60,  9.00,   5.50,  'Tablets',  '2026-03-31', 'Aisle B, Shelf 2', '500mg twice daily',  'Box of 60 tablets', 400, 380, 4),
(5,  'GSK Egypt',             40,  22.00,  15.00, 'Inhaler',  '2025-12-31', 'Aisle C, Shelf 1', '100mcg 2 puffs PRN', '200-dose inhaler',  150, 135, 5),
(6,  'AstraZeneca Egypt',     50,  25.00,  17.00, 'Capsules', '2026-06-30', 'Aisle C, Shelf 2', '40mg once daily',    'Box of 28 capsules',200, 192, 6),
(7,  'Abbott Egypt',          80,  6.00,   3.50,  'Tablets',  '2026-09-30', 'Aisle D, Shelf 1', '400mg 3x daily',     'Box of 24 tablets', 400, 360, 7),
(8,  'Pfizer Egypt',          200, 4.50,   2.50,  'Tablets',  '2027-03-31', 'Aisle D, Shelf 2', '500mg every 6h PRN', 'Box of 24 tablets', 600, 580, 8),
(9,  'Sanofi Egypt',          30,  85.00,  60.00, 'Injection','2025-06-30', 'Refrigerator A',   '10 units at bedtime','Box of 5 pens',     100, 88,  9),
(10, 'GSK Egypt',             60,  32.00,  22.00, 'Tablets',  '2025-12-31', 'Aisle B, Shelf 3', '625mg 2x daily',     'Box of 14 tablets', 250, 230, 10),
(11, 'AstraZeneca Egypt',     50,  35.00,  24.00, 'Tablets',  '2026-09-30', 'Aisle A, Shelf 3', '10mg once daily',    'Box of 28 tablets', 200, 195, 11),
(12, 'Abbott Egypt',          40,  18.00,  12.00, 'Tablets',  '2027-01-31', 'Aisle E, Shelf 1', '100mcg once daily',  'Box of 30 tablets', 180, 172, 12),
(13, 'Bayer Egypt',           60,  28.00,  19.00, 'Tablets',  '2025-11-30', 'Aisle B, Shelf 4', '500mg twice daily',  'Box of 10 tablets', 300, 285, 13),
(14, 'Pfizer Egypt',          20,  15.00,  9.00,  'Tablets',  '2025-08-31', 'Aisle D, Shelf 3', '25mg once daily',    'Box of 20 tablets', 80,  25,  14),
(15, 'Sanofi Egypt',          60,  8.00,   4.50,  'Tablets',  '2026-12-31', 'Aisle C, Shelf 3', '150mg twice daily',  'Box of 30 tablets', 350, 320, 15);

-- ============================================================
-- 18. PRESCRIPTIONS
-- Table: prescription
-- Fields: id, patient_name, doctor_name, prescription_date, notes,
--         status, patient_id, doctor_id, pharmacist_pharmacist_id, created_at
-- ============================================================
INSERT INTO prescription (id, patient_name, doctor_name, prescription_date, notes, status, patient_id, doctor_id, pharmacist_pharmacist_id, created_at) VALUES
(1, 'Ali Mohamed',    'Dr. Omar Khaled',   '2024-06-01', 'Take with meals. Monitor BP daily.',                     'DISPENSED',           29, 3,  17, '2024-06-01 10:00:00'),
(2, 'Fatima Ahmed',   'Dr. Hana Fouad',    '2024-06-02', 'Use inhaler as needed. Keep at all times.',              'PENDING',             30, 6,  NULL,'2024-06-02 11:00:00'),
(3, 'Khaled Ibrahim', 'Dr. Omar Khaled',   '2024-06-03', 'Insulin must be refrigerated.',                          'PENDING',             31, 3,  NULL,'2024-06-03 09:00:00'),
(4, 'Nour Hassan',    'Dr. Nadia Saleh',   '2024-06-04', 'Take at bedtime to avoid drowsiness.',                   'DISPENSED',           32, 4,  18, '2024-06-04 14:00:00'),
(5, 'Hassan Omar',    'Dr. Omar Khaled',   '2024-06-05', 'Take aspirin and statin indefinitely.',                  'DISPENSED',           35, 3,  17, '2024-06-05 10:00:00'),
(6, 'Yasmine Khalil', 'Dr. Rania Gamal',   '2024-06-14', 'Complete full antibiotic course.',                       'PENDING',             38, 10, NULL,'2024-06-14 09:00:00'),
(7, 'Heba Ramzy',     'Dr. Nadia Saleh',   '2024-06-10', 'Continue levothyroxine. Recheck TSH in 3 months.',       'DISPENSED',           40, 4,  18, '2024-06-10 11:00:00'),
(8, 'Mostafa Saad',   'Dr. Tarek Mostafa', '2024-06-08', 'Take ibuprofen with food. Physiotherapy twice weekly.',  'PARTIALLY_DISPENSED', 33, 5,  19, '2024-06-08 09:00:00');

-- ============================================================
-- 19. PRESCRIPTION ITEMS
-- Table: prescription_items
-- Fields: id, medicine_id, medicine_name, dosage, frequency, duration,
--         quantity, instructions, dispensed, dispensed_quantity, prescription_id
-- ============================================================
INSERT INTO prescription_items (id, medicine_id, medicine_name, dosage, frequency, duration, quantity, instructions, dispensed, dispensed_quantity, prescription_id) VALUES
-- Prescription 1: Ali Mohamed (Hypertension)
(1,  1,  'Concor 5mg',      '5mg',    'Once daily',    30, 30,  'Take in the morning with water',       1, 30, 1),
(2,  2,  'Aspirin 100mg',   '100mg',  'Once daily',    30, 30,  'Take after breakfast',                 1, 30, 1),
-- Prescription 2: Fatima Ahmed (Asthma)
(3,  5,  'Ventolin 100mcg', '200mcg', 'As needed',     90, 1,   'Use when short of breath',             0, 0,  2),
(4,  6,  'Nexium 40mg',     '40mg',   'Once daily',    14, 14,  'Take before breakfast',                0, 0,  2),
-- Prescription 3: Khaled Ibrahim (Diabetes)
(5,  4,  'Glucophage 500mg','1000mg', 'Twice daily',   30, 60,  'Take with meals',                      0, 0,  3),
(6,  9,  'Lantus 100IU/mL', '10 IU', 'Once at bedtime',30,1,   'Refrigerate. Inject subcutaneously',   0, 0,  3),
-- Prescription 4: Nour Hassan (Migraine)
(7,  8,  'Panadol 500mg',   '1000mg', 'Every 6h PRN',  7,  28,  'Take at onset of headache',            1, 28, 4),
-- Prescription 5: Hassan Omar (IHD)
(8,  1,  'Concor 5mg',      '5mg',    'Once daily',    30, 30,  'Morning dose',                         1, 30, 5),
(9,  11, 'Crestor 10mg',    '10mg',   'Once at night', 30, 30,  'Bedtime with water',                   1, 30, 5),
(10, 2,  'Aspirin 100mg',   '100mg',  'Once daily',    30, 30,  'Take after meals',                     1, 30, 5),
-- Prescription 6: Yasmine Khalil (UTI)
(11, 13, 'Cipro 500mg',     '500mg',  'Twice daily',   7,  14,  'Complete full course even if better',  0, 0,  6),
-- Prescription 7: Heba Ramzy (Hypothyroidism)
(12, 12, 'Synthroid 100mcg','100mcg', 'Once daily',    30, 30,  'Take on empty stomach 30 min before food',1,30,7),
-- Prescription 8: Mostafa Saad (Lumbar Disc)
(13, 7,  'Brufen 400mg',    '400mg',  'Three times daily',10,30, 'Take with food',                       1, 15, 8),
(14, 8,  'Panadol 500mg',   '500mg',  'Every 8h PRN',  10, 30,  'Supplemental pain relief',             0, 0,  8);

-- ============================================================
-- 20. MEDICINE DISPENSATION
-- Table: medicine_dispensation
-- Fields: id, dispensed_quantity, dispensed_date, status, charges,
--         pharmacist_id (FK), prescription_id (FK), patient_id (FK),
--         pharmacist_pharmacist_id (FK → pharmacists.pharmacist_id)
-- ============================================================
INSERT INTO medicine_dispensation (id, dispensed_quantity, dispensed_date, status, charges, pharmacist_pharmacist_id, prescription_id, patient_id) VALUES
(1, 60,  '2024-06-01', 'DISPENSED', 240.00, 17, 1, 29),
(2, 28,  '2024-06-04', 'DISPENSED', 140.00, 18, 4, 32),
(3, 90,  '2024-06-05', 'DISPENSED', 420.00, 17, 5, 35),
(4, 30,  '2024-06-10', 'DISPENSED', 540.00, 18, 7, 40),
(5, 15,  '2024-06-09', 'DISPENSED', 90.00,  19, 8, 33);

-- ============================================================
-- 21. LAB TESTS
-- Table: lab_tests
-- Fields: id, patient_id, patient_name, doctor_id, doctor_name,
--         technician_id, technician_name, test_type, test_name,
--         description, status, ordered_at, sample_collected_at,
--         completed_at, result, notes, reference_range, is_critical, created_at
-- ============================================================
INSERT INTO lab_tests (id, patient_id, patient_name, doctor_id, doctor_name, technician_id, technician_name, test_type, test_name, description, status, ordered_at, sample_collected_at, completed_at, result, notes, reference_range, is_critical, created_at) VALUES
(1, 29, 'Ali Mohamed',    3,  'Dr. Omar Khaled',   22, 'Ibrahim Shaker', 'COMPLETE_BLOOD_COUNT', 'CBC',              'Routine blood count for hypertension monitoring', 'COMPLETED', '2024-06-01 09:00:00','2024-06-01 10:00:00','2024-06-01 14:00:00','Hb: 14.2 g/dL, WBC: 7,200/µL, Plt: 220,000/µL','All values within normal range','Hb: 12-16 g/dL, WBC: 4,500-11,000/µL', 0, '2024-06-01 09:00:00'),
(2, 31, 'Khaled Ibrahim', 3,  'Dr. Omar Khaled',   22, 'Ibrahim Shaker', 'BLOOD_TEST',           'HbA1c',            'Glycated haemoglobin for diabetes monitoring',    'COMPLETED', '2024-06-03 09:00:00','2024-06-03 10:00:00','2024-06-03 15:00:00','HbA1c: 8.2%',                                    'Poor glycaemic control — intensify treatment','<7.0% (well-controlled)', 1, '2024-06-03 09:00:00'),
(3, 35, 'Hassan Omar',    3,  'Dr. Omar Khaled',   22, 'Ibrahim Shaker', 'LIPID_PANEL',          'Lipid Profile',    'Cardiovascular risk assessment',                  'COMPLETED', '2024-06-05 09:00:00','2024-06-05 10:00:00','2024-06-05 14:00:00','TC: 6.2 mmol/L, LDL: 4.1 mmol/L, HDL: 0.9 mmol/L','LDL elevated — continue statin therapy','LDL <3.0 mmol/L, HDL >1.0 mmol/L', 1, '2024-06-05 09:00:00'),
(4, 38, 'Yasmine Khalil', 10, 'Dr. Rania Gamal',   24, 'Wael Saad',      'URINE_TEST',           'Urine Culture',    'Urine culture and sensitivity for UTI',           'COMPLETED', '2024-06-14 08:30:00','2024-06-14 09:00:00','2024-06-15 12:00:00','E. coli isolated — sensitive to ciprofloxacin',  'UTI confirmed — continue current antibiotic','No organisms (normal)', 0, '2024-06-14 08:30:00'),
(5, 40, 'Heba Ramzy',     4,  'Dr. Nadia Saleh',   22, 'Ibrahim Shaker', 'THYROID_FUNCTION',     'TSH, T3, T4',      'Thyroid function panel for hypothyroidism',       'COMPLETED', '2024-06-10 10:00:00','2024-06-10 11:00:00','2024-06-10 16:00:00','TSH: 6.8 mIU/L (elevated), Free T4: 0.7 ng/dL', 'Hypothyroid — continue levothyroxine','TSH: 0.4–4.0 mIU/L', 0, '2024-06-10 10:00:00'),
(6, 33, 'Mostafa Saad',   5,  'Dr. Tarek Mostafa', 22, 'Ibrahim Shaker', 'BLOOD_TEST',           'ESR & CRP',        'Inflammatory markers for back pain',              'ORDERED',   '2024-06-08 09:00:00', NULL,               NULL,                NULL,                                             NULL,'ESR: 0-20 mm/hr, CRP: <5 mg/L', 0, '2024-06-08 09:00:00'),
(7, 37, 'Sherif Naguib',  7,  'Dr. Youssef Adel',  24, 'Wael Saad',      'COMPLETE_BLOOD_COUNT', 'CBC + Differential','Pre-chemotherapy blood count',                  'IN_PROGRESS','2024-06-18 08:00:00','2024-06-18 09:00:00', NULL,               NULL,                                             'Processing sample','Hb: >10 g/dL required before chemo', 0, '2024-06-18 08:00:00'),
(8, 30, 'Fatima Ahmed',   6,  'Dr. Hana Fouad',    22, 'Ibrahim Shaker', 'BLOOD_TEST',           'IgE Level',        'Allergy and asthma immunological test',           'SAMPLE_COLLECTED','2024-06-15 11:00:00','2024-06-15 12:00:00',NULL,             NULL,                                             'Awaiting analysis','Normal: <100 IU/mL', 0, '2024-06-15 11:00:00');

-- ============================================================
-- 22. RADIOLOGY ORDERS
-- Table: radiology_orders
-- Fields: id, patient_id, patient_name, doctor_id, doctor_name,
--         technician_id, technician_name, order_type, body_part,
--         clinical_indication, contrast, special_instructions, status,
--         ordered_at, scheduled_at, completed_at,
--         report_findings, impression, image_url, is_critical, notes, created_at
-- ============================================================
INSERT INTO radiology_orders (id, patient_id, patient_name, doctor_id, doctor_name, technician_id, technician_name, order_type, body_part, clinical_indication, contrast, special_instructions, status, ordered_at, scheduled_at, completed_at, report_findings, impression, image_url, is_critical, notes, created_at) VALUES
(1, 33, 'Mostafa Saad',   5,  'Dr. Tarek Mostafa', 23, 'Amira Nabil', 'MRI',      'Lumbar Spine', 'Chronic back pain radiating to left leg. Rule out disc herniation.', 'WITHOUT_CONTRAST', NULL,                             'COMPLETED',   '2024-06-01 09:00:00','2024-06-02 10:00:00','2024-06-02 14:00:00','L4-L5 disc herniation with left nerve root compression. Moderate canal stenosis at this level.','L4-L5 disc herniation causing left-sided radiculopathy','https://storage.medicore.eg/radiology/001.dcm', 0, NULL, '2024-06-01 09:00:00'),
(2, 35, 'Hassan Omar',    3,  'Dr. Omar Khaled',   23, 'Amira Nabil', 'ECHOCARDIOGRAM','Heart',  'Assess left ventricular function in known IHD.',                   'NONE',             NULL,                             'COMPLETED',   '2024-06-05 09:00:00','2024-06-06 09:00:00','2024-06-06 13:00:00','LV ejection fraction 42%. Inferior wall hypokinesia. Mild mitral regurgitation.','Reduced LV function — consistent with ischaemic cardiomyopathy','https://storage.medicore.eg/radiology/002.dcm', 1, NULL, '2024-06-05 09:00:00'),
(3, 37, 'Sherif Naguib',  7,  'Dr. Youssef Adel',  23, 'Amira Nabil', 'CT_SCAN',  'Abdomen and Pelvis','Follow-up colorectal cancer — assess treatment response.',     'WITH_CONTRAST',    'Pre-medicate with antihistamine','SCHEDULED',   '2024-06-17 08:00:00','2024-06-19 10:00:00', NULL,              NULL,                                                                                           NULL,                                         NULL,                                           0, 'Bowel prep required night before', '2024-06-17 08:00:00'),
(4, 31, 'Khaled Ibrahim', 3,  'Dr. Omar Khaled',   25, 'Fatma Lotfy', 'XRAY',     'Chest',        'Cardiac size assessment in diabetic patient with dyspnoea.',       'NONE',             NULL,                             'COMPLETED',   '2024-06-03 09:30:00','2024-06-03 10:00:00','2024-06-03 11:30:00','Cardiomegaly. Mild bilateral pleural effusion. No consolidation.','Cardiomegaly with pleural effusion — cardiac cause likely','https://storage.medicore.eg/radiology/004.dcm', 1, NULL, '2024-06-03 09:30:00'),
(5, 34, 'Salma Youssef',  9,  'Dr. Karim Nasser',  25, 'Fatma Lotfy', 'ULTRASOUND','Abdomen',     'Post-appendectomy check — exclude fluid collection.',              'NONE',             NULL,                             'COMPLETED',   '2024-06-10 10:00:00','2024-06-10 11:00:00','2024-06-10 13:00:00','No free fluid in pelvis. Post-operative changes in RIF. Normal bowel loops.','Satisfactory post-appendectomy appearance','https://storage.medicore.eg/radiology/005.dcm', 0, NULL, '2024-06-10 10:00:00'),
(6, 29, 'Ali Mohamed',    3,  'Dr. Omar Khaled',   23, 'Amira Nabil', 'XRAY',     'Chest',        'Annual cardiac surveillance for hypertensive patient.',            'NONE',             NULL,                             'ORDERED',     '2024-06-15 09:00:00', NULL,               NULL,               NULL,                                                                                           NULL,                                         NULL,                                           0, NULL, '2024-06-15 09:00:00');

-- ============================================================
-- 23. BLOOD UNITS
-- Table: blood_units
-- Fields: id, blood_type, quantity, expiry_date, status, notes, created_at
-- ============================================================
INSERT INTO blood_units (id, blood_type, quantity, expiry_date, status, notes, created_at) VALUES
(1,  'A_POSITIVE',  15, '2024-09-30', 'AVAILABLE', 'Donated batch — Group A+',              '2024-06-01 08:00:00'),
(2,  'A_POSITIVE',  8,  '2024-10-15', 'AVAILABLE', 'Donated batch — Group A+',              '2024-06-05 08:00:00'),
(3,  'A_NEGATIVE',  5,  '2024-08-31', 'AVAILABLE', 'Rare type — handle carefully',          '2024-06-01 08:00:00'),
(4,  'B_POSITIVE',  12, '2024-09-15', 'AVAILABLE', 'Donated batch — Group B+',              '2024-06-02 08:00:00'),
(5,  'B_POSITIVE',  6,  '2024-11-01', 'RESERVED',  'Reserved for patient Khaled Ibrahim',   '2024-06-03 08:00:00'),
(6,  'B_NEGATIVE',  4,  '2024-08-20', 'AVAILABLE', 'Rare type — priority stock',            '2024-06-01 08:00:00'),
(7,  'AB_POSITIVE', 10, '2024-10-01', 'AVAILABLE', 'Universal plasma donor',                '2024-06-02 08:00:00'),
(8,  'AB_NEGATIVE', 3,  '2024-09-01', 'AVAILABLE', 'Very rare — strict monitoring',         '2024-06-01 08:00:00'),
(9,  'O_POSITIVE',  20, '2024-09-30', 'AVAILABLE', 'Most common type — large stock',        '2024-06-01 08:00:00'),
(10, 'O_POSITIVE',  10, '2024-11-15', 'AVAILABLE', 'Emergency reserve',                     '2024-06-10 08:00:00'),
(11, 'O_NEGATIVE',  7,  '2024-10-01', 'AVAILABLE', 'Universal donor — critical reserve',    '2024-06-01 08:00:00'),
(12, 'O_NEGATIVE',  0,  '2024-07-01', 'USED',      'Fully used for emergency transfusion',  '2024-05-15 08:00:00'),
(13, 'A_POSITIVE',  0,  '2024-04-01', 'EXPIRED',   'Expired — disposed of safely',          '2024-01-10 08:00:00');

-- ============================================================
-- 24. BLOOD REQUESTS
-- Table: blood_requests
-- Fields: id, patient_id, patient_name, doctor_id, requested_by_name,
--         blood_type, quantity, urgency, status, notes,
--         fulfilled_at, created_at
-- ============================================================
INSERT INTO blood_requests (id, patient_id, patient_name, doctor_id, requested_by_name, blood_type, quantity, urgency, status, notes, fulfilled_at, created_at) VALUES
(1, 31, 'Khaled Ibrahim', 3,  'Dr. Omar Khaled',  'B_POSITIVE',  2, 'HIGH',   'RESERVED',   'Pre-operative transfusion for cardiac procedure', NULL,                   '2024-06-03 10:00:00'),
(2, 37, 'Sherif Naguib',  7,  'Dr. Youssef Adel', 'O_POSITIVE',  3, 'MEDIUM', 'COMPLETED',  'Peri-chemotherapy anaemia support',               '2024-06-12 14:00:00', '2024-06-11 09:00:00'),
(3, 34, 'Salma Youssef',  9,  'Dr. Karim Nasser', 'A_NEGATIVE',  1, 'HIGH',   'COMPLETED',  'Intra-operative transfusion during appendectomy', '2024-06-06 16:00:00', '2024-06-06 14:00:00'),
(4, 35, 'Hassan Omar',    3,  'Dr. Omar Khaled',  'B_NEGATIVE',  2, 'HIGH',   'PENDING',    'Urgent cardiac surgery preparation',              NULL,                   '2024-06-17 08:00:00'),
(5, 29, 'Ali Mohamed',    3,  'Dr. Omar Khaled',  'A_POSITIVE',  1, 'LOW',    'RESERVED',   'Elective procedure blood standby',                NULL,                   '2024-06-15 10:00:00');

-- ============================================================
-- 25. TRANSFER REQUESTS
-- Table: transfer_requests
-- Fields: id, patient_id, patient_name, doctor_id, requested_by_name,
--         to_hospital_id, to_hospital_name, to_hospital_email,
--         reason, status, include_lab_tests, include_radiology,
--         include_diagnoses, transferred_at, created_at
-- ============================================================
INSERT INTO transfer_requests (id, patient_id, patient_name, doctor_id, requested_by_name, to_hospital_id, to_hospital_name, to_hospital_email, reason, status, include_lab_tests, include_radiology, include_diagnoses, transferred_at, created_at) VALUES
(1, 37, 'Sherif Naguib', 7, 'Dr. Youssef Adel', 1, 'Cairo University Hospital',    'referral@cuh.edu.eg',       'Patient requires complex colorectal surgery not available in our facility', 'SENT',    1, 1, 1, '2024-06-18 14:00:00', '2024-06-18 09:00:00'),
(2, 31, 'Khaled Ibrahim',3, 'Dr. Omar Khaled',  2, 'Ain Shams University Hospital','info@ainshams-hosp.edu.eg', 'Advanced cardiac catheterisation lab required for coronary intervention',  'PENDING', 1, 1, 1, NULL,                   '2024-06-17 11:00:00'),
(3, 35, 'Hassan Omar',   3, 'Dr. Omar Khaled',  1, 'Cairo University Hospital',    'referral@cuh.edu.eg',       'Patient needs cardiac bypass surgery — requires advanced cardiac ICU',     'PENDING', 1, 1, 1, NULL,                   '2024-06-18 10:00:00');

-- ============================================================
-- 26. REFRESH TOKENS (sample — for active sessions)
-- Table: refresh_tokens
-- Fields: id, token, user_id, expiry_date
-- ============================================================
INSERT INTO refresh_tokens (id, token, user_id, expiry_date) VALUES
(1, 'sample-refresh-token-admin-001-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 1, DATE_ADD(NOW(), INTERVAL 7 DAY)),
(2, 'sample-refresh-token-doc-003-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab', 3, DATE_ADD(NOW(), INTERVAL 7 DAY)),
(3, 'sample-refresh-token-pat-029-abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890cd', 29,DATE_ADD(NOW(), INTERVAL 7 DAY));

-- ============================================================
-- 27. RE-ENABLE FK CHECKS
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
SELECT 'users'               AS tbl, COUNT(*) AS cnt FROM users
UNION SELECT 'patients',      COUNT(*) FROM patients
UNION SELECT 'doctors',       COUNT(*) FROM doctors
UNION SELECT 'nurses',        COUNT(*) FROM nurses
UNION SELECT 'pharmacists',   COUNT(*) FROM pharmacists
UNION SELECT 'accountants',   COUNT(*) FROM accountants
UNION SELECT 'technicians',   COUNT(*) FROM technicians
UNION SELECT 'receptionists', COUNT(*) FROM receptionists
UNION SELECT 'admin',         COUNT(*) FROM admin
UNION SELECT 'speciality',    COUNT(*) FROM speciality
UNION SELECT 'department',    COUNT(*) FROM department
UNION SELECT 'appointments',  COUNT(*) FROM appointments
UNION SELECT 'beds',          COUNT(*) FROM beds
UNION SELECT 'medicine',      COUNT(*) FROM medicine
UNION SELECT 'medicine_stock',COUNT(*) FROM medicine_stock
UNION SELECT 'prescription',  COUNT(*) FROM prescription
UNION SELECT 'prescription_items',COUNT(*) FROM prescription_items
UNION SELECT 'medicine_dispensation',COUNT(*) FROM medicine_dispensation
UNION SELECT 'lab_tests',     COUNT(*) FROM lab_tests
UNION SELECT 'radiology_orders',COUNT(*) FROM radiology_orders
UNION SELECT 'blood_units',   COUNT(*) FROM blood_units
UNION SELECT 'blood_requests',COUNT(*) FROM blood_requests
UNION SELECT 'external_hospitals',COUNT(*) FROM external_hospitals
UNION SELECT 'transfer_requests',COUNT(*) FROM transfer_requests
UNION SELECT 'refresh_tokens',COUNT(*) FROM refresh_tokens
ORDER BY tbl;
