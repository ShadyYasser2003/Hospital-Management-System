package com.hospital.hms.repository;

import com.hospital.hms.Enum.BedStatus;
import com.hospital.hms.entity.Bed;
import com.hospital.hms.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    Optional<Bed> findByBedNumber(String bedNumber);
    List<Bed> findByWardName(String wardName);
    List<Bed> findByStatus(BedStatus status);
    List<Bed> findByPatient(Patient patient);

}
