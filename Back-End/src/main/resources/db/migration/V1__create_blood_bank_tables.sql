-- ============================================================
-- Blood Bank Module — Initial Schema
-- Project  : HMS new_backend
-- Version  : V1 (safe to run on a fresh database)
--
-- Tables   : blood_units, blood_requests
-- Enums stored as VARCHAR(20) strings — matches @Enumerated(EnumType.STRING)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- blood_units
--   Represents physical bags of blood in inventory.
--   One row = one donation batch of a specific blood type.
--
-- BloodType values : A_POSITIVE | A_NEGATIVE | B_POSITIVE | B_NEGATIVE
--                    AB_POSITIVE | AB_NEGATIVE | O_POSITIVE | O_NEGATIVE
-- BloodUnitStatus  : AVAILABLE | RESERVED | USED | EXPIRED
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blood_units (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    blood_type  VARCHAR(20)  NOT NULL,          -- BloodType enum
    quantity    INT          NOT NULL,          -- units in this batch (≥ 0)
    expiry_date DATE,                           -- nullable = no expiry
    status      VARCHAR(20)  NOT NULL           -- BloodUnitStatus enum
                             DEFAULT 'AVAILABLE',
    notes       TEXT,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT chk_bu_quantity    CHECK (quantity >= 0),
    CONSTRAINT chk_bu_blood_type  CHECK (blood_type IN (
        'A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE',
        'AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE')),
    CONSTRAINT chk_bu_status      CHECK (status IN (
        'AVAILABLE','RESERVED','USED','EXPIRED')),

    INDEX idx_bu_blood_type_status (blood_type, status),
    INDEX idx_bu_expiry            (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ──────────────────────────────────────────────────────────────
-- blood_requests
--   A doctor's request for blood on behalf of a patient.
--
-- BloodRequestStatus   : PENDING | RESERVED | COMPLETED | CANCELLED
-- BloodRequestUrgency  : LOW | MEDIUM | HIGH
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blood_requests (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    patient_id         BIGINT       NOT NULL,   -- FK → patients.patient_id
    patient_name       VARCHAR(255) NOT NULL,   -- denormalized for fast read
    doctor_id          BIGINT       NOT NULL,   -- FK → doctors.doctor_id
    requested_by_name  VARCHAR(255) NOT NULL,   -- denormalized
    blood_type         VARCHAR(20)  NOT NULL,   -- BloodType enum
    quantity           INT          NOT NULL,   -- units requested (> 0)
    urgency            VARCHAR(20)  NOT NULL    DEFAULT 'MEDIUM',
    status             VARCHAR(20)  NOT NULL    DEFAULT 'PENDING',
    notes              TEXT,
    fulfilled_at       DATETIME,               -- set when status → COMPLETED
    created_at         DATETIME     NOT NULL,
    updated_at         DATETIME,

    PRIMARY KEY (id),
    CONSTRAINT fk_br_patient FOREIGN KEY (patient_id)
        REFERENCES patients (patient_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_br_doctor  FOREIGN KEY (doctor_id)
        REFERENCES doctors  (doctor_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_br_quantity   CHECK (quantity > 0),
    CONSTRAINT chk_br_blood_type CHECK (blood_type IN (
        'A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE',
        'AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE')),
    CONSTRAINT chk_br_urgency    CHECK (urgency IN ('LOW','MEDIUM','HIGH')),
    CONSTRAINT chk_br_status     CHECK (status IN (
        'PENDING','RESERVED','COMPLETED','CANCELLED')),

    INDEX idx_br_patient_id (patient_id),
    INDEX idx_br_status     (status),
    INDEX idx_br_blood_type_status (blood_type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
