package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.BedStatus;
import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.BedDTO;
import com.hospital.hms.entity.Bed;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.exception.BedNotFoundException;
import com.hospital.hms.exception.BedNumberAlreadyExist;
import com.hospital.hms.exception.PatientNotFoundException;
import com.hospital.hms.mapper.BedMapper;
import com.hospital.hms.repository.AdminRepository;
import com.hospital.hms.repository.BedRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.service.BedService;
import com.hospital.hms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BedServiceImpl implements BedService {

    private final BedRepository      bedRepository;
    private final PatientRepository  patientRepository;
    private final AdminRepository    adminRepository;
    private final NotificationService notificationService;

    // ── helper: fire-and-forget notification (never throws) ──────────────
    private void notify(Long recipientId, String title, String message, String url) {
        try {
            notificationService.sendNotification(
                    recipientId, title, message, NotificationType.GENERAL, url);
        } catch (Exception e) {
            log.warn("Bed notification skipped for user {}: {}", recipientId, e.getMessage());
        }
    }

    private void notifyAllAdmins(String title, String message, String url) {
        try {
            adminRepository.findAll()
                    .forEach(a -> notify(a.getId(), title, message, url));
        } catch (Exception e) {
            log.warn("Admin bed notification skipped: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BedDTO> getAllBeds() {
        return bedRepository.findAll()
                .stream()
                .map(BedMapper::mapToBedaDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BedDTO getBedById(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        return BedMapper.mapToBedaDTO(bed);
    }

    @Override
    @Transactional(readOnly = true)
    public BedDTO getBedByNumber(String bedNumber) {
        Bed bed = bedRepository.findByBedNumber(bedNumber)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        return BedMapper.mapToBedaDTO(bed);
    }

    @Override
    public BedDTO createBed(BedDTO bedDTO) {
        if (bedRepository.findByBedNumber(bedDTO.getBedNumber()).isPresent()) {
            throw new BedNumberAlreadyExist("Bed number already exists");
        }
        Bed bed = new Bed();
        bed.setBedNumber(bedDTO.getBedNumber());
        bed.setWardName(bedDTO.getWardName());
        bed.setStatus(BedStatus.AVAILABLE);

        Bed savedBed = bedRepository.save(bed);
        return BedMapper.mapToBedaDTO(savedBed);
    }

    @Override
    public BedDTO updateBed(Long id, BedDTO bedDTO) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        bed.setWardName(bedDTO.getWardName());

        Bed updatedBed = bedRepository.save(bed);
        return BedMapper.mapToBedaDTO(updatedBed);
    }

    @Override
    @Transactional
    public BedDTO assignPatientToBed(Long bedId, Long patientId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));

        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new RuntimeException("Bed is already occupied");
        }
        bed.setPatient(patient);
        bed.setPatientName(patient.getName());
        bed.setStatus(BedStatus.OCCUPIED);

        Bed updatedBed = bedRepository.save(bed);

        // ── Notifications ──────────────────────────────────────────────────
        String ward = bed.getWardName() != null ? " (" + bed.getWardName() + ")" : "";

        // 1. Notify the patient
        notify(patient.getId(),
                "You Have Been Admitted",
                "You have been admitted and assigned to Bed " + bed.getBedNumber() + ward + ". "
                + "Please follow the ward staff instructions.",
                "/patient");

        // 2. Notify all admins
        notifyAllAdmins(
                "Patient Admitted",
                patient.getName() + " has been admitted and assigned to Bed "
                + bed.getBedNumber() + ward + ".",
                "/admin/beds");

        return BedMapper.mapToBedaDTO(updatedBed);
    }

    @Override
    @Transactional
    public BedDTO releasePatientFromBed(Long bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));

        Patient releasedPatient = bed.getPatient();
        String  patientName     = bed.getPatientName() != null ? bed.getPatientName() : "Patient";
        String  ward            = bed.getWardName() != null ? " (" + bed.getWardName() + ")" : "";

        bed.setPatient(null);
        bed.setPatientName(null);
        bed.setStatus(BedStatus.AVAILABLE);

        Bed updatedBed = bedRepository.save(bed);

        // ── Notifications ──────────────────────────────────────────────────
        // 1. Notify the patient (if still resolvable)
        if (releasedPatient != null) {
            notify(releasedPatient.getId(),
                    "Checkout Complete",
                    "Your hospital stay has ended and you have been checked out from Bed "
                    + bed.getBedNumber() + ward + ". We wish you a speedy recovery!",
                    "/patient");
        }

        // 2. Notify all admins
        notifyAllAdmins(
                "Patient Checked Out",
                patientName + " has been checked out. Bed "
                + bed.getBedNumber() + ward + " is now available.",
                "/admin/beds");

        return BedMapper.mapToBedaDTO(updatedBed);
    }

    @Override
    public void deleteBed(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        bedRepository.delete(bed);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BedDTO> getBedsByStatus(String status) {
        BedStatus bedStatus = BedStatus.valueOf(status.toUpperCase());
        return bedRepository.findByStatus(bedStatus)
                .stream()
                .map(BedMapper::mapToBedaDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BedDTO> getBedsByWard(String wardName) {
        return bedRepository.findByWardName(wardName)
                .stream()
                .map(BedMapper::mapToBedaDTO)
                .toList();
    }

    @Override
    public BedDTO setMaintenanceMode(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
        if (bed.getStatus() == BedStatus.OCCUPIED) {
            throw new RuntimeException("Cannot set maintenance mode for occupied bed");
        }

        bed.setStatus(BedStatus.MAINTENANCE);
        Bed updatedBed = bedRepository.save(bed);
        return BedMapper.mapToBedaDTO(updatedBed);
    }
}
