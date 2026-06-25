package com.hospital.hms.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Ensures the medicine table id column supports auto-increment inserts.
 * Some legacy schemas were created without AUTO_INCREMENT, which breaks POST /api/medicine.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MedicineSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            String extra = jdbcTemplate.queryForObject(
                    """
                    SELECT EXTRA FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'medicine'
                      AND COLUMN_NAME = 'id'
                    """,
                    String.class
            );

            if (extra != null && extra.toLowerCase().contains("auto_increment")) {
                return;
            }

            Integer maxId = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(MAX(id), 0) FROM medicine",
                    Integer.class
            );
            int nextId = (maxId != null ? maxId : 0) + 1;

            jdbcTemplate.execute("ALTER TABLE medicine MODIFY id INT NOT NULL AUTO_INCREMENT");
            jdbcTemplate.execute("ALTER TABLE medicine AUTO_INCREMENT = " + nextId);
            log.info("Fixed medicine.id column — AUTO_INCREMENT enabled (next id: {})", nextId);
        } catch (Exception ex) {
            log.warn("Could not verify/fix medicine table schema: {}", ex.getMessage());
        }
    }
}
