package com.hospital.hms.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs on startup to fix stale data issues:
 * - Resets ACKNOWLEDGED test requests (with no technician) back to PENDING
 * - Ensures the system is in a consistent state
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(2) // Run after DataSeeder (order 1)
public class DatabaseMigrationRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        fixStaleAcknowledgedRequests();
    }

    private void fixStaleAcknowledgedRequests() {
        try {
            // Reset ACKNOWLEDGED requests with no technician back to PENDING
            int fixed = jdbcTemplate.update(
                "UPDATE test_requests SET status = 'PENDING', technician_id = NULL " +
                "WHERE status = 'ACKNOWLEDGED' AND technician_id IS NULL"
            );
            if (fixed > 0) {
                log.info("Fixed {} stale ACKNOWLEDGED test requests → reset to PENDING", fixed);
            }
        } catch (Exception e) {
            log.warn("Could not fix stale test requests: {}", e.getMessage());
        }
    }
}
