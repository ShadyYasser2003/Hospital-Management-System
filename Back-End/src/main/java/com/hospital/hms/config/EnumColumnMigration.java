package com.hospital.hms.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One-time migration: convert employment_status columns from TINYINT (ordinal)
 * to VARCHAR(20) (string) in all affected tables.
 *
 * Root cause: Doctor, Nurse, and Receptionist entities were missing
 * @Enumerated(EnumType.STRING), so Hibernate stored the enum ordinal index
 * as a TINYINT. This caused:
 *   "Value 'FULL_TIME' is outside of valid range for type java.lang.Byte"
 *
 * This migration runs once on startup. It is safe to run multiple times —
 * it checks the column type before altering.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EnumColumnMigration {

    private final JdbcTemplate jdbc;

    @PostConstruct
    public void migrateEnumColumns() {
        migrateColumn("doctors",      "employment_status");
        migrateColumn("nurses",       "employment_status");
        migrateColumn("receptionists","employment_status");
        fixInvoiceStatusColumn();
        ensurePatientAdmissionColumns();
    }

    /**
     * Ensures admission_date, discharge_date, bed_charge_per_day exist in patients table.
     * Hibernate ddl-auto=update sometimes fails to add columns due to inheritance table structure.
     */
    private void ensurePatientAdmissionColumns() {
        addColumnIfMissing("patients", "admission_date",    "DATETIME NULL");
        addColumnIfMissing("patients", "discharge_date",    "DATETIME NULL");
        addColumnIfMissing("patients", "bed_charge_per_day","DOUBLE NULL");
    }

    private void addColumnIfMissing(String table, String column, String definition) {
        try {
            Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                "WHERE TABLE_SCHEMA = DATABASE() " +
                "AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class, table, column
            );
            if (count == null || count == 0) {
                log.warn("Column {}.{} missing — adding it now", table, column);
                jdbc.execute("ALTER TABLE `" + table + "` ADD COLUMN `" + column + "` " + definition);
                log.info("Added {}.{} successfully", table, column);
            }
        } catch (Exception e) {
            log.error("Failed to add {}.{}: {}", table, column, e.getMessage());
        }
    }

    /**
     * Ensures the invoices.status column is VARCHAR(20) and includes PARTIAL.
     * MySQL ENUM columns reject unknown values — we convert to VARCHAR to be safe.
     */
    private void fixInvoiceStatusColumn() {
        try {
            String dataType = jdbc.queryForObject(
                "SELECT DATA_TYPE FROM information_schema.COLUMNS " +
                "WHERE TABLE_SCHEMA = DATABASE() " +
                "AND TABLE_NAME = 'invoices' AND COLUMN_NAME = 'status'",
                String.class
            );
            if ("enum".equalsIgnoreCase(dataType)) {
                log.warn("invoices.status is ENUM — converting to VARCHAR(20) to support PARTIAL status");
                jdbc.execute("ALTER TABLE `invoices` MODIFY COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING'");
                log.info("invoices.status converted to VARCHAR(20) successfully");
            } else {
                log.debug("invoices.status is {} — no migration needed", dataType);
            }
        } catch (Exception e) {
            log.error("Failed to fix invoices.status column: {}", e.getMessage());
        }
    }

    private void migrateColumn(String table, String column) {
        try {
            // Check current data type of the column
            String dataType = jdbc.queryForObject(
                "SELECT DATA_TYPE FROM information_schema.COLUMNS " +
                "WHERE TABLE_SCHEMA = DATABASE() " +
                "AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                String.class, table, column
            );

            if (dataType == null) {
                log.info("Column {}.{} does not exist — skipping migration", table, column);
                return;
            }

            if ("tinyint".equalsIgnoreCase(dataType) || "int".equalsIgnoreCase(dataType)) {
                log.warn("Migrating {}.{} from {} to VARCHAR(20) ...", table, column, dataType);

                // Step 1: convert numeric ordinal → string name
                // EmploymentStatus ordinals: 0=PART_TIME, 1=FULL_TIME, 2=CONTRACT, 3=ON_LEAVE, 4=CASUAL
                jdbc.execute("ALTER TABLE `" + table + "` MODIFY COLUMN `" + column + "` VARCHAR(20)");

                // Step 2: update any rows that still hold numeric strings
                jdbc.execute("UPDATE `" + table + "` SET `" + column + "` = 'PART_TIME'  WHERE `" + column + "` = '0'");
                jdbc.execute("UPDATE `" + table + "` SET `" + column + "` = 'FULL_TIME'  WHERE `" + column + "` = '1'");
                jdbc.execute("UPDATE `" + table + "` SET `" + column + "` = 'CONTRACT'   WHERE `" + column + "` = '2'");
                jdbc.execute("UPDATE `" + table + "` SET `" + column + "` = 'ON_LEAVE'   WHERE `" + column + "` = '3'");
                jdbc.execute("UPDATE `" + table + "` SET `" + column + "` = 'CASUAL'     WHERE `" + column + "` = '4'");

                log.info("Migration of {}.{} completed successfully", table, column);
            } else {
                log.debug("{}.{} is already {} — no migration needed", table, column, dataType);
            }
        } catch (Exception e) {
            log.error("Failed to migrate {}.{}: {}", table, column, e.getMessage());
        }
    }
}
