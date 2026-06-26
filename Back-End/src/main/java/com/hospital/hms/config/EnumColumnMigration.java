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
