package com.hospital.hms.repository;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NurseRepository extends JpaRepository<Nurse,Long>{

    Optional<Nurse> findByUsername(String userName);
    List<Nurse> findByDepartment(Long departmentId);
    List<Nurse> findByNameContainingIgnoreCase(String name);

    Optional<Nurse> findByNationalId(String nationalId);

    List<Nurse> findByEmploymentStatus(EmploymentStatus status);
    List<Nurse> findBySpecializationContainingIgnoreCase(String specialization);
}
