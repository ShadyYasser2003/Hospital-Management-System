package com.hospital.hms.service;

import com.hospital.hms.dto.TestRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TestRequestService {
    TestRequestDTO createTestRequest(TestRequestDTO dto);
    List<TestRequestDTO> getAll();
    TestRequestDTO getById(Long id);
    List<TestRequestDTO> getByPatient(Long patientId);
    List<TestRequestDTO> getByDoctor(Long doctorId);
    Page<TestRequestDTO> getByTechnician(Long technicianId, Pageable pageable);
    List<TestRequestDTO> getByStatus(String status);
    TestRequestDTO assignTechnician(Long testRequestId, Long technicianId);
    TestRequestDTO acknowledge(Long testRequestId);
    TestRequestDTO startProcessing(Long testRequestId);
    TestRequestDTO complete(Long testRequestId, String results, String reportUrl, Double charges);
    String uploadReport(Long testRequestId, MultipartFile file);
    TestRequestDTO cancel(Long testRequestId);
    void deleteTestRequest(Long id);
}
