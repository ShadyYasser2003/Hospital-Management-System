package com.hospital.hms.repository;

import com.hospital.hms.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {

    Optional<Technician> findByUsername(String username);

    Optional<Technician> findByNationalId(String nationalId);

    List<Technician> findByDepartmentId(Long departmentId);

    List<Technician> findByNameContainingIgnoreCase(String name);
}
