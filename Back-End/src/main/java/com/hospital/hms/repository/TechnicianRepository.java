package com.hospital.hms.repository;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.TechnicianSpecialization;
import com.hospital.hms.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {

    Optional<Technician> findByUsername(String username);

    Optional<Technician> findByNationalId(String nationalId);

    Optional<Technician> findByLicenseNumber(String licenseNumber);

    List<Technician> findByNameContainingIgnoreCase(String name);

    List<Technician> findBySpecialization(TechnicianSpecialization specialization);

    List<Technician> findByEmploymentStatus(EmploymentStatus status);

    List<Technician> findByDepartment_Id(Long departmentId);
}
