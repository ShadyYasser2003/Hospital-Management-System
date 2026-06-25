package com.hospital.hms.repository;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.print.Doc;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor,Long> {

    Optional<Doctor> findByUsername(String userName);

    List<Doctor> findByNameContainingIgnoreCase(String name);

    Optional<Doctor> findByNationalId(String nationalId);
    List<Doctor> findByDepartment(Long departmentId);
    List<Doctor> findByEmploymentStatus(EmploymentStatus status);
    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);
}
