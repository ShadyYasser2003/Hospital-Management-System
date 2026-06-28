package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.TransferStatus;
import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.TransferRequestDto;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.ExternalHospital;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.TransferRequest;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.TransferRequestMapper;
import com.hospital.hms.repository.*;
import com.hospital.hms.service.EmailService;
import com.hospital.hms.service.NotificationService;
import com.hospital.hms.service.PdfGeneratorService;
import com.hospital.hms.service.TransferRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransferRequestServiceImpl implements TransferRequestService {

    private final TransferRequestRepository transferRequestRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final ExternalHospitalRepository externalHospitalRepository;
    private final LabTestRepository labTestRepository;
    private final RadiologyOrderRepository radiologyOrderRepository;
    private final PdfGeneratorService pdfGeneratorService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AdminRepository adminRepository;

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Transfer notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }

    private void notifyAdmins(String title, String message, String url) {
        try { adminRepository.findAll().forEach(a ->
            notify(a.getId(), title, message, NotificationType.GENERAL, url));
        } catch (Exception e) { log.warn("Admin broadcast skipped: {}", e.getMessage()); }
    }



    @Override
    public List<TransferRequestDto> getAllTransfers() {
        return transferRequestRepository.findAll()
                .stream().map(TransferRequestMapper::mapToDto).toList();
    }

    @Override
    public TransferRequestDto getTransferById(Long id) {
        return TransferRequestMapper.mapToDto(findOrThrow(id));
    }

    @Override
    public List<TransferRequestDto> getTransfersByPatient(Long patientId) {
        return transferRequestRepository.findByPatient_Id(patientId)
                .stream().map(TransferRequestMapper::mapToDto).toList();
    }


    @Override
    public TransferRequestDto createTransfer(TransferRequestDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new UserNotFoundException(
                        "Patient not found with id: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getRequestedById())
                .orElseThrow(() -> new UserNotFoundException(
                        "Doctor not found with id: " + dto.getRequestedById()));

        ExternalHospital hospital = externalHospitalRepository.findById(dto.getToHospitalId())
                .orElseThrow(() -> new RuntimeException(
                        "External hospital not found with id: " + dto.getToHospitalId()));

        if (!hospital.getIsActive())
            throw new RuntimeException("Hospital is not active: " + hospital.getName());

        TransferRequest transfer = TransferRequest.builder()
                .patient(patient)
                .patientName(patient.getName())
                .requestedBy(doctor)
                .requestedByName(doctor.getName())
                .toHospital(hospital)
                .toHospitalName(hospital.getName())
                .toHospitalEmail(hospital.getEmail())
                .reason(dto.getReason())
                .status(TransferStatus.PENDING)
                .includeLabTests(dto.getIncludeLabTests() != null && dto.getIncludeLabTests())
                .includeRadiology(dto.getIncludeRadiology() != null && dto.getIncludeRadiology())
                .includeDiagnoses(dto.getIncludeDiagnoses() != null && dto.getIncludeDiagnoses())
                .createdAt(LocalDateTime.now())
                .build();

        TransferRequest saved = transferRequestRepository.save(transfer);

        // Notify doctor about the created transfer request
        notify(doctor.getId(),
                "Transfer Request Created",
                "Transfer request for patient " + patient.getName() +
                " to " + hospital.getName() + " has been created.",
                NotificationType.TRANSFER_REQUEST_CREATED,
                "/doctor/transfers");

        // Notify patient
        notify(patient.getId(),
                "Transfer Request Initiated",
                "Dr. " + doctor.getName() + " has initiated a transfer request for you to " +
                hospital.getName() + ".",
                NotificationType.TRANSFER_REQUEST_CREATED,
                "/patient/history");

        notifyAdmins("Transfer Request Created",
                "Dr. " + doctor.getName() + " initiated transfer of patient " + patient.getName()
                + " to " + hospital.getName() + ".",
                "/admin/hospitals");

        return TransferRequestMapper.mapToDto(saved);
    }


    @Override
    public TransferRequestDto sendTransfer(Long id) {
        TransferRequest transfer = findOrThrow(id);

        if (transfer.getStatus() == TransferStatus.SENT)
            throw new RuntimeException("Transfer already sent for id: " + id);

        try {
            Patient patient = transfer.getPatient();

            List<com.hospital.hms.entity.LabTest> labTests =
                    transfer.getIncludeLabTests()
                            ? labTestRepository.findByPatient_Id(patient.getId())
                            : List.of();

            List<com.hospital.hms.entity.RadiologyOrder> radiologyOrders =
                    transfer.getIncludeRadiology()
                            ? radiologyOrderRepository.findByPatient_Id(patient.getId())
                            : List.of();

            // توليد الـ PDF
            byte[] pdf = pdfGeneratorService.generateTransferPdf(
                    transfer, patient, labTests, radiologyOrders);

            // إرسال الإيميل
            emailService.sendTransferEmail(
                    transfer.getToHospitalEmail(),
                    transfer.getToHospitalName(),
                    transfer.getPatientName(),
                    transfer.getRequestedByName(),
                    pdf);

            transfer.setStatus(TransferStatus.SENT);
            transfer.setTransferredAt(LocalDateTime.now());
            transfer.setUpdatedAt(LocalDateTime.now());

            // Notify doctor of successful transfer
            notify(transfer.getRequestedBy().getId(),
                    "Transfer Sent Successfully",
                    "Transfer records for patient " + transfer.getPatientName() +
                    " have been sent to " + transfer.getToHospitalName() + ".",
                    NotificationType.TRANSFER_REQUEST_SENT,
                    "/doctor/transfers");

            // Notify patient
            notify(transfer.getPatient().getId(),
                    "Transfer Sent",
                    "Your medical records have been sent to " + transfer.getToHospitalName() + ".",
                    NotificationType.TRANSFER_REQUEST_SENT,
                    "/patient/history");

            notifyAdmins("Transfer Sent",
                    "Patient " + transfer.getPatientName() + " records sent to " + transfer.getToHospitalName() + ".",
                    "/admin/hospitals");

        } catch (Exception e) {
            transfer.setStatus(TransferStatus.FAILED);
            transfer.setUpdatedAt(LocalDateTime.now());
            transferRequestRepository.save(transfer);

            // Notify doctor of failure
            notify(transfer.getRequestedBy().getId(),
                    "Transfer Failed",
                    "Transfer for patient " + transfer.getPatientName() +
                    " to " + transfer.getToHospitalName() + " failed. Please try again.",
                    NotificationType.TRANSFER_REQUEST_FAILED,
                    "/doctor/transfers");

            // Notify patient of failure
            notify(transfer.getPatient().getId(),
                    "Transfer Request Failed",
                    "Your transfer request to " + transfer.getToHospitalName() +
                    " could not be completed. Your doctor has been notified.",
                    NotificationType.TRANSFER_REQUEST_FAILED,
                    "/patient/history");

            throw new RuntimeException("Failed to send transfer: " + e.getMessage());
        }

        return TransferRequestMapper.mapToDto(transferRequestRepository.save(transfer));
    }


    private TransferRequest findOrThrow(Long id) {
        return transferRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Transfer request not found with id: " + id));
    }
}