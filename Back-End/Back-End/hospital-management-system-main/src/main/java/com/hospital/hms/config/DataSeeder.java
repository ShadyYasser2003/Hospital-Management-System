package com.hospital.hms.config;

import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.entity.Admin;
import com.hospital.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedSuperAdmin();
    }

    private void seedAdmin() {
        var existing = userRepository.findByUsername("admin");
        if (existing.isPresent()) {
            String storedPassword = existing.get().getPassword();
            if ((storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$"))
                    && passwordEncoder.matches("admin123", storedPassword)) {
                log.info("Admin user already exists with correct password — skipping seed.");
                return;
            }
            // password مش صح — امسح وأعد الإنشاء
            log.warn("Admin password mismatch — deleting and re-seeding...");
            userRepository.delete(existing.get());
            // flush عشان يتأكد الـ delete اتنفذ قبل الـ insert
            userRepository.flush();
        }

        Admin admin = new Admin();
        admin.setUsername("admin");
        admin.setNationalId("1234567890");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setName("Dr. Ahmed Hassan");
        admin.setDateOfBirth(LocalDate.of(1980, 1, 1));
        admin.setEmail("admin@hospital.com");
        admin.setPhone("+1234567890");
        admin.setAddress("Hospital HQ, Main Building");
        admin.setRole(UserRole.ADMIN);
        admin.setUserStatus(UserStatus.ACTIVE);

        userRepository.save(admin);
        log.info("✅ Admin seeded — username: admin | password: admin123");
    }

    /**
     * Seeds a primary Super Admin account that logs into the dashboard.
     * Login is performed with the USERNAME (or national ID), not the email.
     *   • username : superadmin
     *   • email    : superadmin@hospital.com
     *   • password : SuperAdmin@123
     */
    private void seedSuperAdmin() {
        var existing = userRepository.findByUsername("superadmin");
        if (existing.isPresent()) {
            String storedPassword = existing.get().getPassword();
            if ((storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$"))
                    && passwordEncoder.matches("SuperAdmin@123", storedPassword)) {
                log.info("Super Admin user already exists with correct password — skipping seed.");
                return;
            }
            log.warn("Super Admin password mismatch — deleting and re-seeding...");
            userRepository.delete(existing.get());
            userRepository.flush();
        }

        Admin superAdmin = new Admin();
        superAdmin.setUsername("superadmin");
        superAdmin.setNationalId("9999999999");
        superAdmin.setPassword(passwordEncoder.encode("SuperAdmin@123"));
        superAdmin.setName("Super Administrator");
        superAdmin.setDateOfBirth(LocalDate.of(1985, 5, 15));
        superAdmin.setEmail("superadmin@hospital.com");
        superAdmin.setPhone("+201000000000");
        superAdmin.setAddress("Hospital HQ, Administration Floor");
        superAdmin.setRole(UserRole.ADMIN);
        superAdmin.setUserStatus(UserStatus.ACTIVE);

        userRepository.save(superAdmin);
        log.info("✅ Super Admin seeded — login username: superadmin | email: superadmin@hospital.com | password: SuperAdmin@123");
    }
}
