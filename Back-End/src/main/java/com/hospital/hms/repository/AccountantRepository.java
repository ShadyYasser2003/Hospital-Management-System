package com.hospital.hms.repository;

import com.hospital.hms.entity.Accountant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountantRepository extends JpaRepository<Accountant, Long> {
    Optional<Accountant> findByUsername(String username);
    Optional<Accountant> findByNationalId(String nationalId);
    List<Accountant> findByNameContainingIgnoreCase(String name);
}
