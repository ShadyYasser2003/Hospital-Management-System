package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.*;
import com.hospital.hms.dto.BloodDonationDto;
import com.hospital.hms.entity.BloodDonation;
import com.hospital.hms.entity.BloodUnit;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.repository.*;
import com.hospital.hms.service.BloodDonationService;
import com.hospital.hms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BloodDonationServiceImpl implements BloodDonationService {

    private final BloodDonationRepository donationRepository;
    private final BloodUnitRepository     bloodUnitRepository;
    private final PatientRepository       patientRepository;
    private final AdminRepository         adminRepository;
    private final NotificationService     notificationService;

    private void notify(Long recipientId, String title, String message, String url) {
        try { notificationService.sendNotification(
                recipientId, title, message, NotificationType.GENERAL, url); }
        catch (Exception e) { log.warn("Donation notification skipped: {}", e.getMessage()); }
    }

    @Override
    @Transactional
    public BloodDonationDto recordDonation(BloodDonationDto dto) {
        BloodType bloodType;
        try { bloodType = BloodType.valueOf(dto.getBloodType().toUpperCase().replace("+", "_POSITIVE").replace("-", "_NEGATIVE")); }
        catch (Exception e) { throw new RuntimeException("Invalid blood type: " + dto.getBloodType()); }

        DonationType donationType;
        try { donationType = DonationType.valueOf(dto.getDonationType().toUpperCase()); }
        catch (Exception e) { throw new RuntimeException("donationType must be GENERAL or SPECIFIC_PATIENT"); }

        // ── Expiry: default 42 days from donation date ─────────────────────
        LocalDate donationDate = dto.getDonationDate() != null
                ? LocalDate.parse(dto.getDonationDate())
                : LocalDate.now();

        LocalDate expiryDate = dto.getExpiryDate() != null
                ? LocalDate.parse(dto.getExpiryDate())
                : donationDate.plusDays(42);

        // ── Create BloodUnit ───────────────────────────────────────────────
        // For SPECIFIC_PATIENT: unit starts RESERVED; for GENERAL: AVAILABLE
        BloodUnitStatus unitStatus = donationType == DonationType.SPECIFIC_PATIENT
                ? BloodUnitStatus.RESERVED
                : BloodUnitStatus.AVAILABLE;

        BloodUnit unit = bloodUnitRepository.save(BloodUnit.builder()
                .bloodType(bloodType)
                .quantity(dto.getQuantity())
                .expiryDate(expiryDate)
                .status(unitStatus)
                .notes("Donation from " + dto.getDonorName()
                        + (dto.getDonorNationalId() != null ? " (" + dto.getDonorNationalId() + ")" : ""))
                .createdAt(LocalDateTime.now())
                .build());

        // ── Build donation record ──────────────────────────────────────────
        BloodDonation.BloodDonationBuilder builder = BloodDonation.builder()
                .donorName(dto.getDonorName())
                .donorPhone(dto.getDonorPhone())
                .donorNationalId(dto.getDonorNationalId())
                .bloodType(bloodType)
                .quantity(dto.getQuantity())
                .donationDate(donationDate)
                .expiryDate(expiryDate)
                .notes(dto.getNotes())
                .donationType(donationType)
                .bloodUnit(unit)
                .createdAt(LocalDateTime.now());

        // ── Specific patient linking ───────────────────────────────────────
        if (donationType == DonationType.SPECIFIC_PATIENT) {
            if (dto.getTargetPatientId() == null)
                throw new RuntimeException("targetPatientId is required for SPECIFIC_PATIENT donation");

            Patient patient = patientRepository.findById(dto.getTargetPatientId())
                    .orElseThrow(() -> new UserNotFoundException(
                            "Patient not found: " + dto.getTargetPatientId()));
            builder.targetPatient(patient);

            // Notify the target patient
            notify(patient.getId(),
                    "Blood Donation Received",
                    dto.getDonorName() + " has donated " + dto.getQuantity()
                            + " unit(s) of " + dto.getBloodType() + " blood specifically for you.",
                    "/patient/history");

            log.info("Directed donation: {} unit(s) {} reserved for patient {}",
                    dto.getQuantity(), bloodType, patient.getName());
        } else {
            log.info("General donation: {} unit(s) {} added to inventory", dto.getQuantity(), bloodType);
        }

        BloodDonation saved = donationRepository.save(builder.build());

        // Notify all admins
        try {
            String msg = dto.getDonorName() + " donated " + dto.getQuantity()
                    + " unit(s) of " + dto.getBloodType()
                    + (donationType == DonationType.SPECIFIC_PATIENT
                        ? " for patient " + saved.getTargetPatient().getName()
                        : " to general inventory");
            adminRepository.findAll().forEach(a -> notify(a.getId(), "Blood Donation Received", msg, "/admin/blood-bank"));
        } catch (Exception e) { log.warn("Admin donation notification skipped: {}", e.getMessage()); }

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BloodDonationDto> getAll() {
        return donationRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BloodDonationDto> getByPatient(Long patientId) {
        return donationRepository.findByTargetPatient_Id(patientId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    private BloodDonationDto mapToDto(BloodDonation d) {
        return BloodDonationDto.builder()
                .id(d.getId())
                .donorName(d.getDonorName())
                .donorPhone(d.getDonorPhone())
                .donorNationalId(d.getDonorNationalId())
                .bloodType(d.getBloodType() != null ? d.getBloodType().name() : null)
                .quantity(d.getQuantity())
                .donationDate(d.getDonationDate() != null ? d.getDonationDate().toString() : null)
                .expiryDate(d.getExpiryDate() != null ? d.getExpiryDate().toString() : null)
                .notes(d.getNotes())
                .donationType(d.getDonationType() != null ? d.getDonationType().name() : null)
                .targetPatientId(d.getTargetPatient() != null ? d.getTargetPatient().getId() : null)
                .targetPatientName(d.getTargetPatient() != null ? d.getTargetPatient().getName() : null)
                .bloodUnitId(d.getBloodUnit() != null ? d.getBloodUnit().getId() : null)
                .createdAt(d.getCreatedAt() != null ? d.getCreatedAt().toString() : null)
                .build();
    }
}
