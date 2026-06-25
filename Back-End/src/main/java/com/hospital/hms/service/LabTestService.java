package com.hospital.hms.service;

import com.hospital.hms.dto.LabTestDto;

import java.util.List;

public interface LabTestService {

    List<LabTestDto> getAllLabTests();

    LabTestDto getLabTestById(Long id);

    List<LabTestDto> getLabTestsByPatient(Long patientId);

    List<LabTestDto> getLabTestsByDoctor(Long doctorId);

    List<LabTestDto> getLabTestsByTechnician(Long technicianId);

    List<LabTestDto> getLabTestsByStatus(String status);

    List<LabTestDto> getLabTestsByType(String testType);

    List<LabTestDto> getCriticalLabTests();

    List<LabTestDto> getLabTestsByPatientAndStatus(Long patientId, String status);

    LabTestDto createLabTest(LabTestDto labTestDto);

    LabTestDto updateLabTest(Long id, LabTestDto labTestDto);


    LabTestDto assignTechnician(Long labTestId, Long technicianId);

    LabTestDto enterResult(Long labTestId, String result, String notes,
                           String referenceRange, Boolean isCritical);

    void deleteLabTest(Long id);
}
