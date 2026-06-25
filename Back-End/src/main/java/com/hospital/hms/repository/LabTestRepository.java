package com.hospital.hms.repository;

import com.hospital.hms.Enum.LabTestStatus;
import com.hospital.hms.Enum.LabTestType;
import com.hospital.hms.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long> {

    List<LabTest> findByPatient_Id(Long patientId);

    List<LabTest> findByDoctor_Id(Long doctorId);

    List<LabTest> findByTechnician_Id(Long technicianId);

    List<LabTest> findByStatus(LabTestStatus status);

    List<LabTest> findByTestType(LabTestType testType);

    List<LabTest> findByPatient_IdAndStatus(Long patientId, LabTestStatus status);

    List<LabTest> findByIsCriticalTrue();

    List<LabTest> findByTestNameContainingIgnoreCase(String testName);
}
