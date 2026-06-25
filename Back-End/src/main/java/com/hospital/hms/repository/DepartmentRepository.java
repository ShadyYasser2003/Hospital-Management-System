package com.hospital.hms.repository;

import com.hospital.hms.dto.DepartmentDto;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department,Long> {
    Optional<Department> findByNameIgnoreCase(String name);
    Optional<Department> findByNameContainingIgnoreCase(String name);
    @Query("SELECT d FROM Department d WHERE d.isActive = :active")
    List<Department> findByActive(boolean active);
}
