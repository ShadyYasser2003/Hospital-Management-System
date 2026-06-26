-- ============================================================
-- HMS Database Schema Fix — Final Migration
-- Generated from live database inspection
-- Run entire file as ONE execution in MySQL Workbench
-- (Ctrl+A to select all → Ctrl+Shift+Enter to execute all)
-- Does NOT delete data. Only fixes column types.
-- ============================================================

USE hms_backend;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- STEP 1: DROP ALL FOREIGN KEY CONSTRAINTS
-- (exact names from information_schema)
-- ============================================================

ALTER TABLE accountants               DROP FOREIGN KEY accountants_ibfk_1;
ALTER TABLE accountants               DROP FOREIGN KEY FKjad0wynpp7awr6qo7ccqu5un8;
ALTER TABLE admin                     DROP FOREIGN KEY FK5wu7m4u6dii7801jnfs4xqvfu;
ALTER TABLE admin_departments         DROP FOREIGN KEY FKo6vxn8cqqypbtwt9e1rfabmoh;
ALTER TABLE admin_doctors             DROP FOREIGN KEY FK8wnq4lkjoylqeryxy3r5ql4o5;
ALTER TABLE admin_nurses              DROP FOREIGN KEY FKjalemh7ehuftf5asuxjdb9bqj;
ALTER TABLE admin_nurses              DROP FOREIGN KEY FKpenojwxtbhfnwaf24to7jyfav;
ALTER TABLE admin_patients            DROP FOREIGN KEY FKm887s099sks3c0y6xh9mb8vsm;
ALTER TABLE admin_pharmacists         DROP FOREIGN KEY FK42cuv68i89lsrbsmbepxn39li;
ALTER TABLE admin_pharmacists         DROP FOREIGN KEY FKkei5ghb65lrdmqgh3qdg8oipu;
ALTER TABLE admin_receptionists       DROP FOREIGN KEY FKair7ikukjmc7gdx2dt2s3vdc9;
ALTER TABLE admin_receptionists       DROP FOREIGN KEY FKiw55y00i8amj68n8wokg4gcjm;
ALTER TABLE admin_specialities        DROP FOREIGN KEY FKrrkmvp1qeq35ua59wvsn0h196;
ALTER TABLE appointments              DROP FOREIGN KEY appointments_ibfk_1;
ALTER TABLE appointments              DROP FOREIGN KEY appointments_ibfk_2;
ALTER TABLE doctors                   DROP FOREIGN KEY doctors_ibfk_1;
ALTER TABLE doctors                   DROP FOREIGN KEY doctors_ibfk_2;
ALTER TABLE invoice_items             DROP FOREIGN KEY FK46ae0lhu1oqs7cv91fn6y9n7w;
ALTER TABLE invoices                  DROP FOREIGN KEY FK6rou2lor1mf0hjiy88xym2j4p;
ALTER TABLE lab_tests                 DROP FOREIGN KEY FK2brgty0n7yawfsjfb49qbo5ib;
ALTER TABLE medicine_dispensation     DROP FOREIGN KEY FKae6e6r1qcmleiml9ch8tj6hrq;
ALTER TABLE medicine_dispensation     DROP FOREIGN KEY FKrw0a356cq9xlcqfplt7vox1ds;
ALTER TABLE nurses                    DROP FOREIGN KEY FKkhnejtiacbfokwn5g5o22kjqd;
ALTER TABLE nurses                    DROP FOREIGN KEY nurses_ibfk_1;
ALTER TABLE nurses_patients           DROP FOREIGN KEY FKkfgjacukm8s1qfc4sakb75vyc;
ALTER TABLE payments                  DROP FOREIGN KEY FKrbqec6be74wab8iifh8g3i50i;
ALTER TABLE pharmacists               DROP FOREIGN KEY FKrhg2mds0wydsbl1wd8yd4uf63;
ALTER TABLE pharmacists               DROP FOREIGN KEY pharmacists_ibfk_1;
ALTER TABLE pharmacists_categories    DROP FOREIGN KEY FKln8inb88n8v4ww4sgy0dylilv;
ALTER TABLE pharmacists_categories    DROP FOREIGN KEY FKtllea3c3okhr8nrvrbnpty3x0;
ALTER TABLE pharmacists_medicine_list DROP FOREIGN KEY FKkpgl4mk9cr6f0api51fqulyc2;
ALTER TABLE pharmacists_medicine_stocks DROP FOREIGN KEY FK34ce4qs8eu50u9l9c68w9jlpw;
ALTER TABLE pharmacists_medicine_stocks DROP FOREIGN KEY FK76ku5qlivtqy6bnkkcdmnihqa;
ALTER TABLE prescription              DROP FOREIGN KEY FK4ldl5dpgahyre6jpe4kcf7501;
ALTER TABLE prescription_items        DROP FOREIGN KEY prescription_items_ibfk_1;
ALTER TABLE radiology_orders          DROP FOREIGN KEY FKfrlhm9mdn049l5dgc4c6ig5pb;
ALTER TABLE receptionists             DROP FOREIGN KEY FK7827ifvkd15k2c82u7hce7ygv;
ALTER TABLE receptionists             DROP FOREIGN KEY receptionists_ibfk_1;
ALTER TABLE refresh_tokens            DROP FOREIGN KEY FK1lih5y2npsf8u5o3vhdb9y0os;
ALTER TABLE technicians               DROP FOREIGN KEY FKm92eus298m042puk2n2gdpnpj;
ALTER TABLE technicians               DROP FOREIGN KEY technicians_ibfk_1;
ALTER TABLE test_requests             DROP FOREIGN KEY FKej18rpsp09ncblqvt82mnfdqt;
ALTER TABLE transfer_requests         DROP FOREIGN KEY FK8qbl9fxk2i6v8a5diiifyjco9;


-- ============================================================
-- STEP 2: FIX ALL PRIMARY KEY COLUMNS → BIGINT AUTO_INCREMENT
-- ============================================================

-- Root tables
ALTER TABLE users              MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE department         MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE speciality         MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE external_hospitals MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE invoices           MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE medicine           MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE medicine_category  MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE medicine_stock     MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE medicine_dispensation MODIFY COLUMN id         BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE prescription       MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE prescription_items MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE appointments       MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE beds               MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE lab_tests          MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE radiology_orders   MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE blood_units        MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE blood_requests     MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE transfer_requests  MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE refresh_tokens     MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE test_requests      MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE notifications      MODIFY COLUMN id            BIGINT NOT NULL AUTO_INCREMENT;

-- Joined-inheritance subtable PKs (FK to users.id — must also be BIGINT)
ALTER TABLE patients           MODIFY COLUMN patient_id        BIGINT NOT NULL;
ALTER TABLE doctors            MODIFY COLUMN doctor_id         BIGINT NOT NULL;
ALTER TABLE nurses             MODIFY COLUMN nurse_id          BIGINT NOT NULL;
ALTER TABLE receptionists      MODIFY COLUMN receptionist_id   BIGINT NOT NULL;
ALTER TABLE pharmacists        MODIFY COLUMN pharmacist_id     BIGINT NOT NULL;
ALTER TABLE accountants        MODIFY COLUMN accountant_id     BIGINT NOT NULL;
ALTER TABLE technicians        MODIFY COLUMN tech_id           BIGINT NOT NULL;
ALTER TABLE admin              MODIFY COLUMN admin_id          BIGINT NOT NULL;


-- ============================================================
-- STEP 3: FIX ALL FOREIGN KEY COLUMNS → BIGINT
-- ============================================================

-- doctors
ALTER TABLE doctors  MODIFY COLUMN speciality_id         BIGINT;
ALTER TABLE doctors  MODIFY COLUMN department_id          BIGINT;

-- nurses
ALTER TABLE nurses   MODIFY COLUMN department_id          BIGINT;
ALTER TABLE nurses   MODIFY COLUMN speciality_id          BIGINT;

-- receptionists
ALTER TABLE receptionists MODIFY COLUMN department_id     BIGINT;

-- pharmacists
ALTER TABLE pharmacists   MODIFY COLUMN department_id     BIGINT;

-- technicians
ALTER TABLE technicians   MODIFY COLUMN department_id     BIGINT;

-- accountants
ALTER TABLE accountants   MODIFY COLUMN department_id     BIGINT;

-- appointments
ALTER TABLE appointments  MODIFY COLUMN patient_id        BIGINT NOT NULL;
ALTER TABLE appointments  MODIFY COLUMN doctor_id         BIGINT NOT NULL;

-- prescription
ALTER TABLE prescription  MODIFY COLUMN patient_id        BIGINT NOT NULL;
ALTER TABLE prescription  MODIFY COLUMN doctor_id         BIGINT NOT NULL;
ALTER TABLE prescription  MODIFY COLUMN pharmacist_id     BIGINT;
ALTER TABLE prescription  MODIFY COLUMN pharmacist_pharmacist_id BIGINT;

-- prescription_items
ALTER TABLE prescription_items MODIFY COLUMN prescription_id BIGINT;
ALTER TABLE prescription_items MODIFY COLUMN medicine_id     BIGINT NOT NULL;

-- medicine_stock
ALTER TABLE medicine_stock  MODIFY COLUMN medicine_id     BIGINT;

-- medicine_dispensation
ALTER TABLE medicine_dispensation MODIFY COLUMN pharmacist_id           BIGINT;
ALTER TABLE medicine_dispensation MODIFY COLUMN pharmacist_pharmacist_id BIGINT;
ALTER TABLE medicine_dispensation MODIFY COLUMN prescription_id         BIGINT;
ALTER TABLE medicine_dispensation MODIFY COLUMN patient_id              BIGINT;

-- invoices
ALTER TABLE invoices      MODIFY COLUMN patient_id        BIGINT;
ALTER TABLE invoices      MODIFY COLUMN accountant_id     BIGINT;

-- invoice_items
ALTER TABLE invoice_items MODIFY COLUMN invoice_id        BIGINT;

-- payments
ALTER TABLE payments      MODIFY COLUMN invoice_id        BIGINT;
ALTER TABLE payments      MODIFY COLUMN patient_id        BIGINT;

-- lab_tests
ALTER TABLE lab_tests     MODIFY COLUMN patient_id        BIGINT NOT NULL;
ALTER TABLE lab_tests     MODIFY COLUMN doctor_id         BIGINT NOT NULL;
ALTER TABLE lab_tests     MODIFY COLUMN technician_id     BIGINT;

-- radiology_orders
ALTER TABLE radiology_orders MODIFY COLUMN patient_id     BIGINT NOT NULL;
ALTER TABLE radiology_orders MODIFY COLUMN doctor_id      BIGINT NOT NULL;
ALTER TABLE radiology_orders MODIFY COLUMN technician_id  BIGINT;

-- blood_requests
ALTER TABLE blood_requests MODIFY COLUMN patient_id       BIGINT NOT NULL;
ALTER TABLE blood_requests MODIFY COLUMN doctor_id        BIGINT NOT NULL;

-- transfer_requests
ALTER TABLE transfer_requests MODIFY COLUMN patient_id    BIGINT NOT NULL;
ALTER TABLE transfer_requests MODIFY COLUMN doctor_id     BIGINT NOT NULL;
ALTER TABLE transfer_requests MODIFY COLUMN to_hospital_id BIGINT NOT NULL;

-- refresh_tokens
ALTER TABLE refresh_tokens MODIFY COLUMN user_id          BIGINT NOT NULL;

-- test_requests
ALTER TABLE test_requests MODIFY COLUMN patient_id        BIGINT;
ALTER TABLE test_requests MODIFY COLUMN doctor_id         BIGINT;
ALTER TABLE test_requests MODIFY COLUMN technician_id     BIGINT;

-- notifications
ALTER TABLE notifications MODIFY COLUMN recipient_id      BIGINT;

-- beds
ALTER TABLE beds MODIFY COLUMN patient_id                 BIGINT;

-- Join table columns
ALTER TABLE admin_departments    MODIFY COLUMN admins_admin_id          BIGINT NOT NULL;
ALTER TABLE admin_departments    MODIFY COLUMN departments_id           BIGINT NOT NULL;

ALTER TABLE admin_doctors        MODIFY COLUMN admins_admin_id          BIGINT NOT NULL;

ALTER TABLE admin_nurses         MODIFY COLUMN admins_admin_id          BIGINT NOT NULL;
ALTER TABLE admin_nurses         MODIFY COLUMN nurses_nurse_id          BIGINT NOT NULL;

ALTER TABLE admin_patients       MODIFY COLUMN admins_admin_id          BIGINT NOT NULL;

ALTER TABLE admin_pharmacists    MODIFY COLUMN admins_admin_id          BIGINT NOT NULL;
ALTER TABLE admin_pharmacists    MODIFY COLUMN pharmacists_pharmacist_id BIGINT NOT NULL;

ALTER TABLE admin_receptionists  MODIFY COLUMN admins_admin_id                  BIGINT NOT NULL;
ALTER TABLE admin_receptionists  MODIFY COLUMN receptionists_receptionist_id    BIGINT NOT NULL;

ALTER TABLE admin_specialities   MODIFY COLUMN admins_admin_id          BIGINT NOT NULL;

ALTER TABLE nurses_patients      MODIFY COLUMN nurses_nurse_id          BIGINT NOT NULL;
ALTER TABLE nurses_patients      MODIFY COLUMN patients_patient_id      BIGINT NOT NULL;

ALTER TABLE pharmacists_categories     MODIFY COLUMN pharmacists_pharmacist_id  BIGINT NOT NULL;
ALTER TABLE pharmacists_categories     MODIFY COLUMN categories_id              BIGINT NOT NULL;

ALTER TABLE pharmacists_medicine_list  MODIFY COLUMN pharmacists_pharmacist_id  BIGINT NOT NULL;
ALTER TABLE pharmacists_medicine_list  MODIFY COLUMN medicine_list_id           BIGINT NOT NULL;

ALTER TABLE pharmacists_medicine_stocks MODIFY COLUMN pharmacists_pharmacist_id BIGINT NOT NULL;
ALTER TABLE pharmacists_medicine_stocks MODIFY COLUMN medicine_stocks_id        BIGINT NOT NULL;

ALTER TABLE medicine_category_medicine_list MODIFY COLUMN medicine_category_id  BIGINT NOT NULL;
ALTER TABLE medicine_category_medicine_list MODIFY COLUMN medicine_list_id      BIGINT NOT NULL;


-- ============================================================
-- STEP 4: RECREATE ALL FOREIGN KEY CONSTRAINTS
-- ============================================================

-- User hierarchy
ALTER TABLE patients       ADD CONSTRAINT fk_patients_users        FOREIGN KEY (patient_id)        REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE doctors        ADD CONSTRAINT fk_doctors_users          FOREIGN KEY (doctor_id)         REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE nurses         ADD CONSTRAINT fk_nurses_users           FOREIGN KEY (nurse_id)          REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE receptionists  ADD CONSTRAINT fk_receptionists_users    FOREIGN KEY (receptionist_id)   REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE pharmacists    ADD CONSTRAINT fk_pharmacists_users      FOREIGN KEY (pharmacist_id)     REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE accountants    ADD CONSTRAINT fk_accountants_users      FOREIGN KEY (accountant_id)     REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE technicians    ADD CONSTRAINT fk_technicians_users      FOREIGN KEY (tech_id)           REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE admin          ADD CONSTRAINT fk_admin_users            FOREIGN KEY (admin_id)          REFERENCES users(id) ON DELETE CASCADE;

-- Staff → Department / Speciality
ALTER TABLE doctors        ADD CONSTRAINT fk_doctors_dept           FOREIGN KEY (department_id)          REFERENCES department(id);
ALTER TABLE doctors        ADD CONSTRAINT fk_doctors_speciality     FOREIGN KEY (speciality_id)          REFERENCES speciality(id);
ALTER TABLE nurses         ADD CONSTRAINT fk_nurses_dept            FOREIGN KEY (department_id)          REFERENCES department(id);
ALTER TABLE nurses         ADD CONSTRAINT fk_nurses_speciality      FOREIGN KEY (speciality_id)          REFERENCES speciality(id);
ALTER TABLE receptionists  ADD CONSTRAINT fk_receptionists_dept     FOREIGN KEY (department_id)          REFERENCES department(id);
ALTER TABLE pharmacists    ADD CONSTRAINT fk_pharmacists_dept       FOREIGN KEY (department_id)          REFERENCES department(id);
ALTER TABLE technicians    ADD CONSTRAINT fk_technicians_dept       FOREIGN KEY (department_id)          REFERENCES department(id);
ALTER TABLE accountants    ADD CONSTRAINT fk_accountants_dept       FOREIGN KEY (department_id)          REFERENCES department(id);

-- Appointments
ALTER TABLE appointments   ADD CONSTRAINT fk_appt_patient           FOREIGN KEY (patient_id)  REFERENCES patients(patient_id);
ALTER TABLE appointments   ADD CONSTRAINT fk_appt_doctor            FOREIGN KEY (doctor_id)   REFERENCES doctors(doctor_id);

-- Prescriptions
ALTER TABLE prescription   ADD CONSTRAINT fk_rx_patient             FOREIGN KEY (patient_id)              REFERENCES patients(patient_id);
ALTER TABLE prescription   ADD CONSTRAINT fk_rx_doctor              FOREIGN KEY (doctor_id)               REFERENCES doctors(doctor_id);
ALTER TABLE prescription   ADD CONSTRAINT fk_rx_pharmacist          FOREIGN KEY (pharmacist_pharmacist_id) REFERENCES pharmacists(pharmacist_id);
ALTER TABLE prescription_items ADD CONSTRAINT fk_rxitem_rx          FOREIGN KEY (prescription_id) REFERENCES prescription(id) ON DELETE CASCADE;
ALTER TABLE prescription_items ADD CONSTRAINT fk_rxitem_med         FOREIGN KEY (medicine_id)     REFERENCES medicine(id);

-- Medicine
ALTER TABLE medicine_stock        ADD CONSTRAINT fk_stock_medicine   FOREIGN KEY (medicine_id)            REFERENCES medicine(id) ON DELETE CASCADE;
ALTER TABLE medicine_dispensation ADD CONSTRAINT fk_disp_rx          FOREIGN KEY (prescription_id)        REFERENCES prescription(id);
ALTER TABLE medicine_dispensation ADD CONSTRAINT fk_disp_pharmacist  FOREIGN KEY (pharmacist_pharmacist_id) REFERENCES pharmacists(pharmacist_id);
ALTER TABLE medicine_dispensation ADD CONSTRAINT fk_disp_patient     FOREIGN KEY (patient_id)             REFERENCES patients(patient_id);

-- Invoices / Payments
ALTER TABLE invoices       ADD CONSTRAINT fk_inv_accountant          FOREIGN KEY (accountant_id) REFERENCES accountants(accountant_id);
ALTER TABLE invoice_items  ADD CONSTRAINT fk_invitem_invoice         FOREIGN KEY (invoice_id)    REFERENCES invoices(id) ON DELETE CASCADE;
ALTER TABLE payments       ADD CONSTRAINT fk_pay_invoice             FOREIGN KEY (invoice_id)    REFERENCES invoices(id);

-- Lab / Radiology
ALTER TABLE lab_tests         ADD CONSTRAINT fk_lab_technician       FOREIGN KEY (technician_id)  REFERENCES technicians(tech_id);
ALTER TABLE radiology_orders  ADD CONSTRAINT fk_rad_technician       FOREIGN KEY (technician_id)  REFERENCES technicians(tech_id);

-- Blood Requests
ALTER TABLE blood_requests    ADD CONSTRAINT fk_br_patient           FOREIGN KEY (patient_id) REFERENCES patients(patient_id);
ALTER TABLE blood_requests    ADD CONSTRAINT fk_br_doctor            FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id);

-- Transfer Requests
ALTER TABLE transfer_requests ADD CONSTRAINT fk_tr_patient           FOREIGN KEY (patient_id)     REFERENCES patients(patient_id);
ALTER TABLE transfer_requests ADD CONSTRAINT fk_tr_doctor            FOREIGN KEY (doctor_id)      REFERENCES doctors(doctor_id);
ALTER TABLE transfer_requests ADD CONSTRAINT fk_tr_hospital          FOREIGN KEY (to_hospital_id) REFERENCES external_hospitals(id);

-- Refresh Tokens
ALTER TABLE refresh_tokens    ADD CONSTRAINT fk_rt_user              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Admin join tables
ALTER TABLE admin_departments    ADD CONSTRAINT fk_admdep_admin      FOREIGN KEY (admins_admin_id)  REFERENCES admin(admin_id)  ON DELETE CASCADE;
ALTER TABLE admin_departments    ADD CONSTRAINT fk_admdep_dept       FOREIGN KEY (departments_id)   REFERENCES department(id)   ON DELETE CASCADE;
ALTER TABLE admin_doctors        ADD CONSTRAINT fk_admdoc_admin      FOREIGN KEY (admins_admin_id)  REFERENCES admin(admin_id)  ON DELETE CASCADE;
ALTER TABLE admin_nurses         ADD CONSTRAINT fk_admnur_admin      FOREIGN KEY (admins_admin_id)  REFERENCES admin(admin_id)  ON DELETE CASCADE;
ALTER TABLE admin_nurses         ADD CONSTRAINT fk_admnur_nurse      FOREIGN KEY (nurses_nurse_id)  REFERENCES nurses(nurse_id) ON DELETE CASCADE;
ALTER TABLE admin_patients       ADD CONSTRAINT fk_admpat_admin      FOREIGN KEY (admins_admin_id)  REFERENCES admin(admin_id)  ON DELETE CASCADE;
ALTER TABLE admin_pharmacists    ADD CONSTRAINT fk_admpha_admin      FOREIGN KEY (admins_admin_id)              REFERENCES admin(admin_id)             ON DELETE CASCADE;
ALTER TABLE admin_pharmacists    ADD CONSTRAINT fk_admpha_pha        FOREIGN KEY (pharmacists_pharmacist_id)    REFERENCES pharmacists(pharmacist_id)   ON DELETE CASCADE;
ALTER TABLE admin_receptionists  ADD CONSTRAINT fk_admrec_admin      FOREIGN KEY (admins_admin_id)              REFERENCES admin(admin_id)             ON DELETE CASCADE;
ALTER TABLE admin_receptionists  ADD CONSTRAINT fk_admrec_rec        FOREIGN KEY (receptionists_receptionist_id) REFERENCES receptionists(receptionist_id) ON DELETE CASCADE;
ALTER TABLE admin_specialities   ADD CONSTRAINT fk_admspe_admin      FOREIGN KEY (admins_admin_id)  REFERENCES admin(admin_id)  ON DELETE CASCADE;

-- Nurse ↔ Patient
ALTER TABLE nurses_patients      ADD CONSTRAINT fk_nurpat_nurse      FOREIGN KEY (nurses_nurse_id)       REFERENCES nurses(nurse_id)         ON DELETE CASCADE;
ALTER TABLE nurses_patients      ADD CONSTRAINT fk_nurpat_patient     FOREIGN KEY (patients_patient_id)   REFERENCES patients(patient_id)     ON DELETE CASCADE;

-- Pharmacist join tables
ALTER TABLE pharmacists_categories     ADD CONSTRAINT fk_phact_pha   FOREIGN KEY (pharmacists_pharmacist_id) REFERENCES pharmacists(pharmacist_id) ON DELETE CASCADE;
ALTER TABLE pharmacists_categories     ADD CONSTRAINT fk_phact_cat   FOREIGN KEY (categories_id)             REFERENCES medicine_category(id)      ON DELETE CASCADE;
ALTER TABLE pharmacists_medicine_list  ADD CONSTRAINT fk_phamed_pha  FOREIGN KEY (pharmacists_pharmacist_id) REFERENCES pharmacists(pharmacist_id) ON DELETE CASCADE;
ALTER TABLE pharmacists_medicine_list  ADD CONSTRAINT fk_phamed_med  FOREIGN KEY (medicine_list_id)          REFERENCES medicine(id)              ON DELETE CASCADE;
ALTER TABLE pharmacists_medicine_stocks ADD CONSTRAINT fk_phastk_pha FOREIGN KEY (pharmacists_pharmacist_id) REFERENCES pharmacists(pharmacist_id) ON DELETE CASCADE;
ALTER TABLE pharmacists_medicine_stocks ADD CONSTRAINT fk_phastk_stk FOREIGN KEY (medicine_stocks_id)        REFERENCES medicine_stock(id)         ON DELETE CASCADE;

-- MedicineCategory ↔ Medicine
ALTER TABLE medicine_category_medicine_list ADD CONSTRAINT fk_catmed_cat FOREIGN KEY (medicine_category_id) REFERENCES medicine_category(id) ON DELETE CASCADE;
ALTER TABLE medicine_category_medicine_list ADD CONSTRAINT fk_catmed_med FOREIGN KEY (medicine_list_id)     REFERENCES medicine(id)          ON DELETE CASCADE;

-- ============================================================
-- STEP 5: RE-ENABLE FK CHECKS
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- STEP 6: VERIFY — every id column should show 'auto_increment'
-- ============================================================
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, EXTRA
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME = 'id'
  AND EXTRA LIKE '%auto_increment%'
ORDER BY TABLE_NAME;
