package com.hospital.hms.repository;

import com.hospital.hms.entity.Department;
import com.hospital.hms.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacistRepository extends JpaRepository<Pharmacist, Long> {
    Optional<Pharmacist> findByNationalId(String nationalId);
    List<Pharmacist> findByDepartment(Department department);
    List<Pharmacist> findByNameContainingIgnoreCase(String name);
    Optional<Pharmacist> findByUsername(String userName);
}
