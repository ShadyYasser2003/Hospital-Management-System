package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.LabTestStatus;
import com.hospital.hms.Enum.LabTestType;
import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.LabTestDto;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.LabTest;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.Technician;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.LabTestMapper;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.LabTestRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.repository.TechnicianRepository;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.LabTestService;
import com.hospital.hms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabTestServiceImpl implements LabTestService {
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;

    private final LabTestRepository labTestRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TechnicianRepository technicianRepository;

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Lab notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }


    @Override
    public List<LabTestDto> getAllLabTests() {
        return labTestRepository.findAll()
                .stream().map(LabTestMapper::mapToDto).toList();
    }

    @Override
    public LabTestDto getLabTestById(Long id) {
        return LabTestMapper.mapToDto(findOrThrow(id));
    }

    @Override
    public List<LabTestDto> getLabTestsByPatient(Long patientId) {
        return labTestRepository.findByPatient_Id(patientId)
                .stream().map(LabTestMapper::mapToDto).toList();
    }

    @Override
    public List<LabTestDto> getLabTestsByDoctor(Long doctorId) {
        return labTestRepository.findByDoctor_Id(doctorId)
                .stream().map(LabTestMapper::mapToDto).toList();
    }

    @Override
    public List<LabTestDto> getLabTestsByTechnician(Long technicianId) {
        return labTestRepository.findByTechnician_Id(technicianId)
                .stream().map(LabTestMapper::mapToDto).toList();
    }

    @Override
    public List<LabTestDto> getLabTestsByStatus(String status) {
        if (status == null || status.isBlank()) return Collections.emptyList();
        try {
            LabTestStatus enumStatus = LabTestStatus.valueOf(status.toUpperCase().trim());
            return labTestRepository.findByStatus(enumStatus)
                    .stream().map(LabTestMapper::mapToDto).toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid lab test status: " + status);
        }
    }

    @Override
    public List<LabTestDto> getLabTestsByType(String testType) {
        if (testType == null || testType.isBlank()) return Collections.emptyList();
        try {
            LabTestType enumType = LabTestType.valueOf(testType.toUpperCase().trim());
            return labTestRepository.findByTestType(enumType)
                    .stream().map(LabTestMapper::mapToDto).toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid test type: " + testType);
        }
    }

    @Override
    public List<LabTestDto> getCriticalLabTests() {
        return labTestRepository.findByIsCriticalTrue()
                .stream().map(LabTestMapper::mapToDto).toList();
    }

    @Override
    public List<LabTestDto> getLabTestsByPatientAndStatus(Long patientId, String status) {
        try {
            LabTestStatus enumStatus = LabTestStatus.valueOf(status.toUpperCase().trim());
            return labTestRepository.findByPatient_IdAndStatus(patientId, enumStatus)
                    .stream().map(LabTestMapper::mapToDto).toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid lab test status: " + status);
        }
    }

    @Override
    public LabTestDto createLabTest(LabTestDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new UserNotFoundException(
                        "Patient not found with id: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new UserNotFoundException(
                        "Doctor not found with id: " + dto.getDoctorId()));

        LabTest labTest = LabTestMapper.mapToEntity(dto);
        labTest.setPatient(patient);
        labTest.setPatientName(patient.getName());
        labTest.setDoctor(doctor);
        labTest.setDoctorName(doctor.getName());

        // Default testName to testType string if not provided
        if (labTest.getTestName() == null || labTest.getTestName().isBlank()) {
            labTest.setTestName(labTest.getTestType() != null ? labTest.getTestType().toString() : "N/A");
        }

        if (dto.getTechnicianId() != null) {
            Technician tech = technicianRepository.findById(dto.getTechnicianId())
                    .orElseThrow(() -> new UserNotFoundException(
                            "Technician not found with id: " + dto.getTechnicianId()));
            labTest.setTechnician(tech);
            labTest.setTechnicianName(tech.getName());
        }

        labTest.setStatus(LabTestStatus.ORDERED);
        labTest.setOrderedAt(LocalDateTime.now());
        labTest.setCreatedAt(LocalDateTime.now());

        LabTest saved = labTestRepository.save(labTest);

        // Notify patient
        notify(patient.getId(),
                "Lab Test Ordered",
                "Dr. " + doctor.getName() + " has ordered a " + saved.getTestType() + " test for you.",
                NotificationType.TEST_ASSIGNED,
                "/patient/history");

        // Notify all technicians
        try {
            technicianRepository.findAll().forEach(tech ->
                notify(tech.getId(),
                        "New Lab Test Request",
                        "A new " + saved.getTestType() + " test has been ordered for patient " + patient.getName() + ".",
                        NotificationType.TEST_ASSIGNED,
                        "/technician/requests"));
        } catch (Exception e) {
            log.warn("Could not notify technicians about lab test: {}", e.getMessage());
        }

        return LabTestMapper.mapToDto(saved);
    }

    @Override
    public LabTestDto updateLabTest(Long id, LabTestDto dto) {
        LabTest existing = findOrThrow(id);

        if (dto.getTestName() != null)      existing.setTestName(dto.getTestName());
        if (dto.getDescription() != null)   existing.setDescription(dto.getDescription());
        if (dto.getNotes() != null)         existing.setNotes(dto.getNotes());
        if (dto.getResult() != null)        existing.setResult(dto.getResult());
        if (dto.getReferenceRange() != null) existing.setReferenceRange(dto.getReferenceRange());

        if (dto.getIsCritical() != null)    existing.setIsCritical(dto.getIsCritical());

        if (dto.getTestType() != null && !dto.getTestType().isBlank()) {
            existing.setTestType(
                    LabTestType.valueOf(dto.getTestType().toUpperCase().trim()));
        }

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            LabTestStatus newStatus = LabTestStatus.valueOf(dto.getStatus().toUpperCase().trim());
            existing.setStatus(newStatus);
            if (newStatus == LabTestStatus.SAMPLE_COLLECTED && existing.getSampleCollectedAt() == null)
                existing.setSampleCollectedAt(LocalDateTime.now());
            if (newStatus == LabTestStatus.COMPLETED && existing.getCompletedAt() == null)
                existing.setCompletedAt(LocalDateTime.now());
        }

        if (dto.getTechnicianId() != null) {
            Technician tech = technicianRepository.findById(dto.getTechnicianId())
                    .orElseThrow(() -> new UserNotFoundException(
                            "Technician not found with id: " + dto.getTechnicianId()));
            existing.setTechnician(tech);
            existing.setTechnicianName(tech.getName());
        }

        existing.setUpdatedAt(LocalDateTime.now());

        return LabTestMapper.mapToDto(labTestRepository.save(existing));


    }

    @Override
    public LabTestDto assignTechnician(Long labTestId, Long technicianId) {
        LabTest labTest = findOrThrow(labTestId);

        Technician tech = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new UserNotFoundException(
                        "Technician not found with id: " + technicianId));

        labTest.setTechnician(tech);
        labTest.setTechnicianName(tech.getName());

        if (labTest.getStatus() == LabTestStatus.ORDERED) {
            labTest.setStatus(LabTestStatus.IN_PROGRESS);
        }
        labTest.setUpdatedAt(LocalDateTime.now());

        return LabTestMapper.mapToDto(labTestRepository.save(labTest));
    }

    @Override
    public LabTestDto enterResult(Long labTestId, String result, String notes, String referenceRange, Boolean isCritical) {
        LabTest labTest = findOrThrow(labTestId);

        if (result == null || result.isBlank())
            throw new RuntimeException("Result cannot be empty");

        labTest.setResult(result);
        if (notes != null)          labTest.setNotes(notes);
        if (referenceRange != null) labTest.setReferenceRange(referenceRange);
        labTest.setIsCritical(isCritical != null && isCritical);
        labTest.setStatus(LabTestStatus.COMPLETED);
        labTest.setCompletedAt(LocalDateTime.now());
        labTest.setUpdatedAt(LocalDateTime.now());

        LabTest saved = labTestRepository.save(labTest);

        // Notify patient that results are ready
        notify(saved.getPatient().getId(),
                "Lab Results Ready",
                "Your " + saved.getTestType() + " results are now available.",
                NotificationType.TEST_COMPLETED,
                "/patient/history");

        // Notify doctor
        notify(saved.getDoctor().getId(),
                "Lab Results Ready",
                "Results for " + saved.getTestType() + " of patient " + saved.getPatientName() + " are ready.",
                NotificationType.TEST_COMPLETED,
                "/doctor/tests");

        // Auto-add lab test charge to patient invoice
        if (saved.getPatient() != null) {
            try {
                double charge = 50.0; // default lab test fee — adjust per test type
                if (saved.getTestType() == LabTestType.COMPLETE_BLOOD_COUNT) charge = 75.0;
                else if (saved.getTestType() == LabTestType.LIPID_PANEL || saved.getTestType() == LabTestType.LIVER_FUNCTION
                        || saved.getTestType() == LabTestType.KIDNEY_FUNCTION || saved.getTestType() == LabTestType.THYROID_FUNCTION)
                    charge = 100.0;
                else if (saved.getTestType() == LabTestType.BIOPSY || saved.getTestType() == LabTestType.PCR) charge = 200.0;

                invoiceService.addTestCharge(
                        saved.getPatient().getId(), saved.getId(),
                        saved.getTestType().toString(), charge);
            } catch (Exception e) {
                log.warn("Could not add lab charge to invoice for test {}: {}", labTestId, e.getMessage());
            }
        }

        return LabTestMapper.mapToDto(saved);
    }

    @Override
    public void deleteLabTest(Long id) {
        labTestRepository.delete(findOrThrow(id));
    }

    private LabTest findOrThrow(Long id) {
        return labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTest not found with id: " + id));
    }
}
