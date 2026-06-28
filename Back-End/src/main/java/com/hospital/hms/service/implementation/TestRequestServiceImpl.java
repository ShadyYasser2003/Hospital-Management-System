package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.Enum.TestRequestStatus;
import com.hospital.hms.dto.TestRequestDTO;
import com.hospital.hms.entity.*;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.TestRequestMapper;
import com.hospital.hms.repository.*;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.NotificationService;
import com.hospital.hms.service.TestRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestRequestServiceImpl implements TestRequestService {

    private final TestRequestRepository testRequestRepository;
    private final PatientRepository     patientRepository;
    private final DoctorRepository      doctorRepository;
    private final UserRepository        userRepository;
    private final TechnicianRepository  technicianRepository;
    private final AccountantRepository  accountantRepository;
    private final NotificationService   notificationService;
    private final InvoiceService        invoiceService;
    private final AdminRepository       adminRepository;

    private static final String UPLOAD_DIR = "uploads/reports/";

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String actionUrl) {
        try { notificationService.sendNotification(recipientId, title, message, type, actionUrl); }
        catch (Exception e) { log.warn("Notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }

    private void notifyAdmins(String title, String message, String url) {
        try { adminRepository.findAll().forEach(a ->
            notify(a.getId(), title, message, NotificationType.GENERAL, url));
        } catch (Exception e) { log.warn("Admin broadcast skipped: {}", e.getMessage()); }
    }

    private TestRequest getEntity(Long id) {
        return testRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test request not found: " + id));
    }

    @Override @Transactional
    public TestRequestDTO createTestRequest(TestRequestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new UserNotFoundException("Patient not found: " + dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new UserNotFoundException("Doctor not found: " + dto.getDoctorId()));

        // Guard: patient must have an open invoice before any operation
        invoiceService.requireOpenInvoice(patient.getId());

        TestRequest tr = TestRequest.builder()
                .testType(dto.getTestType()).description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority().toUpperCase() : "NORMAL")
                .status(TestRequestStatus.PENDING).charges(dto.getCharges())
                .patient(patient).doctor(doctor)
                .requestedAt(LocalDateTime.now()).build();

        TestRequest saved = testRequestRepository.save(tr);

        notify(patient.getId(), "Test Requested",
                "Dr. " + doctor.getName() + " has requested a " + dto.getTestType() + " test for you.",
                NotificationType.TEST_ASSIGNED, "/patient/tests/" + saved.getId());

        try {
            technicianRepository.findAll().forEach(tech ->
                notify(tech.getId(), "New Test Request Available",
                        "A new " + dto.getTestType() + " test is available.",
                        NotificationType.TEST_ASSIGNED, "/technician/requests"));
        } catch (Exception e) { log.warn("Could not notify technicians: {}", e.getMessage()); }

        notifyAdmins("New Test Requested",
                "Dr. " + doctor.getName() + " requested " + dto.getTestType() + " test for " + patient.getName() + ".",
                "/admin/diagnosis");

        return TestRequestMapper.mapToDto(saved);
    }

    @Override @Transactional(readOnly = true)
    public List<TestRequestDTO> getAll() {
        return testRequestRepository.findAll().stream()
                .map(TestRequestMapper::mapToDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public TestRequestDTO getById(Long id) { return TestRequestMapper.mapToDto(getEntity(id)); }

    @Override @Transactional(readOnly = true)
    public List<TestRequestDTO> getByPatient(Long patientId) {
        return testRequestRepository.findByPatientId(patientId).stream()
                .map(TestRequestMapper::mapToDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<TestRequestDTO> getByDoctor(Long doctorId) {
        return testRequestRepository.findByDoctorId(doctorId).stream()
                .map(TestRequestMapper::mapToDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public Page<TestRequestDTO> getByTechnician(Long technicianId, Pageable pageable) {
        return testRequestRepository.findByTechnicianId(technicianId, pageable)
                .map(TestRequestMapper::mapToDto);
    }

    @Override @Transactional(readOnly = true)
    public List<TestRequestDTO> getByStatus(String status) {
        return testRequestRepository.findByStatus(TestRequestStatus.valueOf(status.toUpperCase()))
                .stream().map(TestRequestMapper::mapToDto).collect(Collectors.toList());
    }

    @Override @Transactional
    public TestRequestDTO assignTechnician(Long testRequestId, Long technicianId) {
        TestRequest tr = getEntity(testRequestId);

        if (tr.getTechnician() != null && tr.getTechnician().getId().equals(technicianId))
            return TestRequestMapper.mapToDto(tr);

        if (tr.getStatus() != TestRequestStatus.PENDING)
            throw new RuntimeException("Test request no longer available (status: " + tr.getStatus() + ")");

        User tech = technicianRepository.findById(technicianId)
                .<User>map(t -> t)
                .orElseGet(() -> userRepository.findById(technicianId)
                        .orElseThrow(() -> new UserNotFoundException("Technician not found: " + technicianId)));

        if (tech.getRole() != com.hospital.hms.Enum.UserRole.TECHNICIAN)
            throw new RuntimeException("User " + technicianId + " is not a technician");

        tr.setTechnician(tech);
        tr.setStatus(TestRequestStatus.ACKNOWLEDGED);
        TestRequest saved = testRequestRepository.save(tr);

        notify(tech.getId(), "New Test Assigned",
                "You have been assigned a " + tr.getTestType() + " test for " + tr.getPatient().getName(),
                NotificationType.TEST_ASSIGNED, "/technician/requests");

        notify(tr.getDoctor().getId(), "Test Assigned to Technician",
                "The " + tr.getTestType() + " test for patient " + tr.getPatient().getName()
                        + " has been assigned to a technician.",
                NotificationType.TEST_ASSIGNED, "/doctor/tests/" + saved.getId());

        return TestRequestMapper.mapToDto(saved);
    }

    @Override @Transactional
    public TestRequestDTO acknowledge(Long id) {
        TestRequest tr = getEntity(id);
        tr.setStatus(TestRequestStatus.ACKNOWLEDGED);
        return TestRequestMapper.mapToDto(testRequestRepository.save(tr));
    }

    @Override @Transactional
    public TestRequestDTO startProcessing(Long id) {
        TestRequest tr = getEntity(id);
        tr.setStatus(TestRequestStatus.IN_PROGRESS);
        return TestRequestMapper.mapToDto(testRequestRepository.save(tr));
    }

    @Override @Transactional
    public TestRequestDTO complete(Long testRequestId, String results, String reportUrl, Double charges) {
        TestRequest tr = getEntity(testRequestId);
        tr.setStatus(TestRequestStatus.COMPLETED);
        tr.setResults(results);
        tr.setReportUrl(reportUrl);
        tr.setCompletedAt(LocalDateTime.now());
        if (charges != null) tr.setCharges(charges);

        TestRequest saved = testRequestRepository.save(tr);

        notify(tr.getDoctor().getId(), "Test Results Ready",
                "Results for " + tr.getTestType() + " of patient " + tr.getPatient().getName() + " are ready.",
                NotificationType.TEST_COMPLETED, "/doctor/tests/" + saved.getId());

        notify(tr.getPatient().getId(), "Your Test Results Are Ready",
                "Your " + tr.getTestType() + " results are now available.",
                NotificationType.TEST_COMPLETED, "/patient/tests/" + saved.getId());

        notifyAdmins("Test Completed",
                tr.getTestType() + " test for patient " + tr.getPatient().getName() + " has been completed.",
                "/admin/diagnosis");

        if (saved.getCharges() != null && saved.getCharges() > 0) {
            try {
                invoiceService.addTestCharge(saved.getPatient().getId(), saved.getId(),
                        saved.getTestType(), saved.getCharges());
            } catch (Exception e) {
                log.warn("Could not add test charge to invoice for test {}: {}", testRequestId, e.getMessage());
            }
        }

        return TestRequestMapper.mapToDto(saved);
    }

    @Override @Transactional
    public String uploadReport(Long testRequestId, MultipartFile file) {
        TestRequest tr = getEntity(testRequestId);
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            String original  = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "report");
            String extension = original.contains(".") ? original.substring(original.lastIndexOf(".")) : "";
            String stored    = "test_" + testRequestId + "_" + UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), uploadPath.resolve(stored), StandardCopyOption.REPLACE_EXISTING);
            String url = "/" + UPLOAD_DIR + stored;
            tr.setReportUrl(url);
            testRequestRepository.save(tr);
            return url;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload report: " + e.getMessage());
        }
    }

    @Override @Transactional
    public TestRequestDTO cancel(Long id) {
        TestRequest tr = getEntity(id);
        tr.setStatus(TestRequestStatus.CANCELLED);
        TestRequest saved = testRequestRepository.save(tr);

        notify(tr.getPatient().getId(), "Test Request Cancelled",
                "Your " + tr.getTestType() + " test request has been cancelled.",
                NotificationType.TEST_COMPLETED, "/patient/tests/" + saved.getId());

        notify(tr.getDoctor().getId(), "Test Request Cancelled",
                "The " + tr.getTestType() + " test for patient " + tr.getPatient().getName() + " has been cancelled.",
                NotificationType.TEST_COMPLETED, "/doctor/tests/" + saved.getId());

        notifyAdmins("Test Request Cancelled",
                tr.getTestType() + " test for patient " + tr.getPatient().getName() + " was cancelled.",
                "/admin/diagnosis");

        return TestRequestMapper.mapToDto(saved);
    }

    @Override @Transactional
    public void deleteTestRequest(Long id) { testRequestRepository.deleteById(id); }
}
