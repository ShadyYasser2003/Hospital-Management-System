package com.hospital.hms.service;

import com.hospital.hms.dto.TestRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TestRequestService {

    /** Doctor creates a test request */
    TestRequestDTO createTestRequest(TestRequestDTO dto);

    List<TestRequestDTO> getAll();

    TestRequestDTO getById(Long id);

    List<TestRequestDTO> getByPatient(Long patientId);

    List<TestRequestDTO> getByDoctor(Long doctorId);

    /** Technician views their assigned tests */
    Page<TestRequestDTO> getByTechnician(Long technicianId, Pageable pageable);

    List<TestRequestDTO> getByStatus(String status);

    /** Admin/Doctor assigns a test to a technician */
    TestRequestDTO assignTechnician(Long testRequestId, Long technicianId);

    /** Technician acknowledges the test */
    TestRequestDTO acknowledge(Long testRequestId);

    /** Technician marks test as in-progress */
    TestRequestDTO startProcessing(Long testRequestId);

    /**
     * Technician completes the test:
     * - sets status = COMPLETED
     * - stores results & reportUrl
     * - triggers notification to doctor
     * - triggers billing (creates invoice item)
     */
    TestRequestDTO complete(Long testRequestId, String results, String reportUrl, Double charges);

    /** Technician uploads a report file and returns the stored path/URL */
    String uploadReport(Long testRequestId, MultipartFile file);

    TestRequestDTO cancel(Long testRequestId);

    void deleteTestRequest(Long id);
}
