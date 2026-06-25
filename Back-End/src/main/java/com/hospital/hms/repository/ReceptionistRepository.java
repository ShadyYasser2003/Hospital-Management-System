package com.hospital.hms.repository;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.entity.Receptionist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {

    List<Receptionist> findByNameContainingIgnoreCase(String name);
    Optional<Receptionist> findByNationalId(String nationalId);
    Optional<Receptionist> findByUsername(String username);
    List<Receptionist> findBySpecialityAreaContainingIgnoreCase(String specialityArea);
    List<Receptionist> findByEmploymentStatus(EmploymentStatus employmentStatus);
}
