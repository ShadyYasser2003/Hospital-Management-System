package com.hospital.hms.repository;

import com.hospital.hms.Enum.TestRequestStatus;
import com.hospital.hms.entity.TestRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestRequestRepository extends JpaRepository<TestRequest, Long> {
    List<TestRequest> findByPatientId(Long patientId);
    List<TestRequest> findByDoctorId(Long doctorId);
    List<TestRequest> findByTechnicianId(Long technicianId);
    List<TestRequest> findByStatus(TestRequestStatus status);
    Page<TestRequest> findByTechnicianId(Long technicianId, Pageable pageable);
    Page<TestRequest> findByPatientId(Long patientId, Pageable pageable);
    List<TestRequest> findByTechnicianIdAndStatus(Long technicianId, TestRequestStatus status);
}
