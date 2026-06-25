package com.hospital.hms.repository;

import com.hospital.hms.Enum.PatientStatus;
import com.hospital.hms.entity.Department;
import com.hospital.hms.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient,Long> {
    Optional<Patient> findByNationalId(String nationalId);
    Optional<Patient> findByEmail(String email);
    List<Patient> findByPatientStatus(PatientStatus status);
    List<Patient> findByNameContainingIgnoreCase(String name);
}
