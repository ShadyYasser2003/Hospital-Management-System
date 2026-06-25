package com.hospital.hms.repository;

import com.hospital.hms.Enum.PrescriptionStatus;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatient(Patient patient);
    List<Prescription> findByStatus(PrescriptionStatus status);
    List<Prescription> findByPrescriptionDate(LocalDate date);
    List<Prescription> findByPatientAndStatus(Patient patient, PrescriptionStatus status);
}