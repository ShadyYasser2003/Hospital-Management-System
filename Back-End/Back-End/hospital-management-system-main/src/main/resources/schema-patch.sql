-- ============================================================
-- Schema patch — runs on every startup. All statements are safe
-- to execute multiple times (IF NOT EXISTS / IGNORE).
-- ============================================================

-- 1. Reset ALL stale test requests to PENDING so technicians can take them
UPDATE test_requests SET status = 'PENDING', technician_id = NULL
WHERE status IN ('ACKNOWLEDGED', 'IN_PROGRESS') AND technician_id IS NOT NULL;

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    title        VARCHAR(255) NOT NULL,
    message      TEXT         NOT NULL,
    type         VARCHAR(100) NOT NULL,
    `read`       TINYINT(1)   NOT NULL DEFAULT 0,
    action_url   VARCHAR(500),
    created_at   DATETIME     NOT NULL,
    read_at      DATETIME,
    recipient_id BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    status         VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    total_amount   DOUBLE       NOT NULL DEFAULT 0,
    paid_amount    DOUBLE       NOT NULL DEFAULT 0,
    notes          TEXT,
    created_at     DATETIME     NOT NULL,
    updated_at     DATETIME,
    patient_id     BIGINT       NOT NULL,
    accountant_id  BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_invoice_patient    FOREIGN KEY (patient_id)    REFERENCES users(id),
    CONSTRAINT fk_invoice_accountant FOREIGN KEY (accountant_id) REFERENCES users(id)
);

-- 4. Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    description  VARCHAR(500) NOT NULL,
    item_type    VARCHAR(100) NOT NULL,
    quantity     INT          NOT NULL DEFAULT 1,
    unit_price   DOUBLE       NOT NULL,
    total        DOUBLE       NOT NULL,
    reference_id BIGINT,
    invoice_id   BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 5. Payments table
CREATE TABLE IF NOT EXISTS payments (
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    amount           DOUBLE      NOT NULL,
    payment_method   VARCHAR(50) NOT NULL,
    notes            TEXT,
    reference_number VARCHAR(255),
    paid_at          DATETIME    NOT NULL,
    invoice_id       BIGINT      NOT NULL,
    patient_id       BIGINT      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    CONSTRAINT fk_payment_patient FOREIGN KEY (patient_id) REFERENCES users(id)
);

-- 6. Test requests table (technician_id → users.id directly)
CREATE TABLE IF NOT EXISTS test_requests (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    test_type     VARCHAR(255) NOT NULL,
    description   TEXT,
    priority      VARCHAR(50)  NOT NULL DEFAULT 'NORMAL',
    status        VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    report_url    VARCHAR(500),
    results       TEXT,
    charges       DOUBLE,
    requested_at  DATETIME     NOT NULL,
    completed_at  DATETIME,
    patient_id    BIGINT       NOT NULL,
    doctor_id     BIGINT       NOT NULL,
    technician_id BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_tr_patient    FOREIGN KEY (patient_id)    REFERENCES users(id),
    CONSTRAINT fk_tr_doctor     FOREIGN KEY (doctor_id)     REFERENCES users(id),
    CONSTRAINT fk_tr_technician FOREIGN KEY (technician_id) REFERENCES users(id)
);

-- 7. Technicians joined table
CREATE TABLE IF NOT EXISTS technicians (
    tech_id             BIGINT NOT NULL,
    license_number      VARCHAR(255),
    specialization      VARCHAR(255),
    years_of_experience INT,
    hire_date           DATE,
    employment_status   VARCHAR(50),
    shift               VARCHAR(100),
    department_id       BIGINT,
    PRIMARY KEY (tech_id),
    CONSTRAINT fk_tech_user FOREIGN KEY (tech_id) REFERENCES users(id)
);

-- 8. Accountants joined table
CREATE TABLE IF NOT EXISTS accountants (
    accountant_id     BIGINT NOT NULL,
    employee_number   VARCHAR(255),
    employment_status VARCHAR(50),
    shift             VARCHAR(100),
    department_id     BIGINT,
    PRIMARY KEY (accountant_id),
    CONSTRAINT fk_acc_user FOREIGN KEY (accountant_id) REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS notifications (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    title        VARCHAR(255) NOT NULL,
    message      TEXT         NOT NULL,
    type         VARCHAR(100) NOT NULL,
    `read`       TINYINT(1)   NOT NULL DEFAULT 0,
    action_url   VARCHAR(500),
    created_at   DATETIME     NOT NULL,
    read_at      DATETIME,
    recipient_id BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    invoice_number VARCHAR(100)   NOT NULL UNIQUE,
    status         VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    total_amount   DOUBLE         NOT NULL DEFAULT 0,
    paid_amount    DOUBLE         NOT NULL DEFAULT 0,
    notes          TEXT,
    created_at     DATETIME       NOT NULL,
    updated_at     DATETIME,
    patient_id     BIGINT         NOT NULL,
    accountant_id  BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_invoice_patient    FOREIGN KEY (patient_id)    REFERENCES users(id),
    CONSTRAINT fk_invoice_accountant FOREIGN KEY (accountant_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id           BIGINT         NOT NULL AUTO_INCREMENT,
    description  VARCHAR(500)   NOT NULL,
    item_type    VARCHAR(100)   NOT NULL,
    quantity     INT            NOT NULL DEFAULT 1,
    unit_price   DOUBLE         NOT NULL,
    total        DOUBLE         NOT NULL,
    reference_id BIGINT,
    invoice_id   BIGINT         NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    amount           DOUBLE       NOT NULL,
    payment_method   VARCHAR(50)  NOT NULL,
    notes            TEXT,
    reference_number VARCHAR(255),
    paid_at          DATETIME     NOT NULL,
    invoice_id       BIGINT       NOT NULL,
    patient_id       BIGINT       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    CONSTRAINT fk_payment_patient FOREIGN KEY (patient_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS test_requests (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    test_type    VARCHAR(255) NOT NULL,
    description  TEXT,
    priority     VARCHAR(50)  NOT NULL DEFAULT 'NORMAL',
    status       VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    report_url   VARCHAR(500),
    results      TEXT,
    charges      DOUBLE,
    requested_at DATETIME     NOT NULL,
    completed_at DATETIME,
    patient_id   BIGINT       NOT NULL,
    doctor_id    BIGINT       NOT NULL,
    technician_id BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_tr_patient    FOREIGN KEY (patient_id)    REFERENCES users(id),
    CONSTRAINT fk_tr_doctor     FOREIGN KEY (doctor_id)     REFERENCES users(id),
    CONSTRAINT fk_tr_technician FOREIGN KEY (technician_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS technicians (
    tech_id            BIGINT NOT NULL,
    license_number     VARCHAR(255),
    specialization     VARCHAR(255),
    years_of_experience INT,
    hire_date          DATE,
    employment_status  VARCHAR(50),
    shift              VARCHAR(100),
    department_id      BIGINT,
    PRIMARY KEY (tech_id),
    CONSTRAINT fk_tech_user FOREIGN KEY (tech_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS accountants (
    accountant_id      BIGINT NOT NULL,
    employee_number    VARCHAR(255),
    employment_status  VARCHAR(50),
    shift              VARCHAR(100),
    department_id      BIGINT,
    PRIMARY KEY (accountant_id),
    CONSTRAINT fk_acc_user FOREIGN KEY (accountant_id) REFERENCES users(id)
);
