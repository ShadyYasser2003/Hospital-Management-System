package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.Enum.PrescriptionStatus;
import com.hospital.hms.dto.PrescriptionDTO;
import com.hospital.hms.dto.PrescriptionItemDTO;
import com.hospital.hms.entity.*;
import com.hospital.hms.mapper.PrescriptionItemMapper;
import com.hospital.hms.mapper.PrescriptionMapper;
import com.hospital.hms.repository.*;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.NotificationService;
import com.hospital.hms.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionServiceImpl implements PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository itemRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String actionUrl) {
        try {
            notificationService.sendNotification(recipientId, title, message, type, actionUrl);
        } catch (Exception e) {
            log.warn("Notification skipped for user {}: {}", recipientId, e.getMessage());
        }
    }

    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll()
                .stream()
                .map(PrescriptionMapper::mapToPrescriptionDTO)
                .toList();
    }

    @Override
    public PrescriptionDTO getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        return PrescriptionMapper.mapToPrescriptionDTO(prescription);
    }

    @Override
    public List<PrescriptionDTO> getPrescriptionsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return prescriptionRepository.findByPatient(patient)
                .stream()
                .map(PrescriptionMapper::mapToPrescriptionDTO)
                .toList();
    }

    @Override
    public List<PrescriptionDTO> getPrescriptionsByDoctor(Long doctorId) {
        // Try doctor table first, then fall back to user ID query
        return prescriptionRepository.findByDoctorId(doctorId)
                .stream()
                .map(PrescriptionMapper::mapToPrescriptionDTO)
                .toList();
    }

    @Override
    public PrescriptionDTO createPrescription(PrescriptionDTO prescriptionDTO) {
        Patient patient = patientRepository.findById(prescriptionDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(prescriptionDTO.getDoctorId())
                .orElseGet(() -> {
                    com.hospital.hms.entity.User u = userRepository.findById(prescriptionDTO.getDoctorId())
                            .orElseThrow(() -> new RuntimeException("Doctor not found"));
                    Doctor d = new Doctor();
                    d.setId(u.getId());
                    d.setName(u.getName());
                    d.setUsername(u.getUsername());
                    d.setEmail(u.getEmail());
                    d.setPhone(u.getPhone());
                    d.setNationalId(u.getNationalId());
                    d.setRole(u.getRole());
                    d.setUserStatus(u.getUserStatus());
                    d.setPassword(u.getPassword());
                    d.setAddress(u.getAddress());
                    d.setDateOfBirth(u.getDateOfBirth());
                    return doctorRepository.save(d);
                });

        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setPatientName(patient.getName());
        prescription.setDoctor(doctor);
        prescription.setDoctorName(doctor.getName());
        prescription.setPrescriptionDate(LocalDate.now());
        prescription.setNotes(prescriptionDTO.getNotes());
        prescription.setStatus(PrescriptionStatus.PENDING);
        prescription.setUpdatedAt(LocalDateTime.now());
        if (prescriptionDTO.getItems() != null) {
            for(PrescriptionItemDTO item: prescriptionDTO.getItems()){
                if (item.getMedicineId() == null || item.getMedicineId() == 0) continue;
                PrescriptionItem item1= new PrescriptionItem();
                Medicine medicine= medicineRepository.findById(item.getMedicineId())
                        .orElseThrow(()-> new RuntimeException("Medicine not found with id: "+item.getMedicineId()));
                item1.setMedicine(medicine);
                item1.setMedicineName(medicine.getGenericName() != null && !medicine.getGenericName().isBlank()
                        ? medicine.getGenericName() : medicine.getName());
                item1.setDosage(item.getDosage());
                item1.setFrequency(item.getFrequency());
                item1.setDuration(item.getDuration());
                item1.setQuantity(item.getQuantity());
                item1.setInstructions(item.getInstructions());
                item1.setDispensedQuantity(0);
                item1.setDispensed(false);
                prescription.addPrescriptionItem(item1);
            }
        }

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Notify patient about new prescription
        notify(patient.getId(),
                "New Prescription",
                "Dr. " + doctor.getName() + " has issued a new prescription for you.",
                NotificationType.PRESCRIPTION_CREATED,
                "/patient/prescriptions");

        return PrescriptionMapper.mapToPrescriptionDTO(savedPrescription);
    }

    @Override
    public PrescriptionDTO updatePrescription(Long id, PrescriptionDTO prescriptionDTO) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        prescription.setNotes(prescriptionDTO.getNotes());
        prescription.setUpdatedAt(LocalDateTime.now());
        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return PrescriptionMapper.mapToPrescriptionDTO(updatedPrescription);
    }

    @Override
    public void deletePrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        prescriptionRepository.delete(prescription);
    }

    @Override
    public List<PrescriptionDTO> getPrescriptionsByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException("Status cannot be empty");
        }
        PrescriptionStatus prescriptionStatus =
                PrescriptionStatus.valueOf(status.trim().toUpperCase());
        return prescriptionRepository.findByStatus(prescriptionStatus)
                .stream()
                .map(PrescriptionMapper::mapToPrescriptionDTO)
                .toList();
    }

    @Override
    public PrescriptionDTO markAsDispensed(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        prescription.setStatus(PrescriptionStatus.DISPENSED);
        Prescription saved = prescriptionRepository.save(prescription);

        // Notify patient
        notify(saved.getPatient().getId(),
                "Prescription Dispensed",
                "Your prescription has been dispensed by the pharmacy.",
                NotificationType.PRESCRIPTION_DISPENSED,
                "/patient/prescriptions");

        // Notify doctor
        if (saved.getDoctor() != null) {
            notify(saved.getDoctor().getId(),
                    "Prescription Dispensed",
                    "Prescription for patient " + saved.getPatient().getName() + " has been dispensed.",
                    NotificationType.PRESCRIPTION_DISPENSED,
                    "/doctor/prescriptions");
        }

        // ── Trigger billing: add medication charge to patient invoice ──────
        try {
            if (saved.getPatient() != null) {
                // Calculate total charge from prescription items
                double totalCharge = saved.getItems().stream()
                        .mapToDouble(item -> {
                            if (item.getMedicine() != null) {
                                // Use a default price if no stock price available
                                return item.getQuantity() * 10.0; // default unit price
                            }
                            return 0.0;
                        })
                        .sum();

                if (totalCharge > 0) {
                    invoiceService.addMedicationCharge(
                            saved.getPatient().getId(),
                            saved.getId(),
                            "Prescription #" + saved.getId() + " — " + saved.getItems().size() + " medication(s)",
                            totalCharge
                    );
                    log.info("Medication charge added to invoice for prescription {}", id);
                }
            }
        } catch (Exception e) {
            log.warn("Could not add medication charge to invoice for prescription {}: {}", id, e.getMessage());
        }

        return PrescriptionMapper.mapToPrescriptionDTO(saved);
    }

    @Override
    public PrescriptionDTO markAsPartiallyDispensed(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        prescription.setStatus(PrescriptionStatus.PARTIALLY_DISPENSED);
        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return PrescriptionMapper.mapToPrescriptionDTO(updatedPrescription);
    }

    @Override
    public PrescriptionDTO cancelPrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        prescription.setStatus(PrescriptionStatus.CANCELLED);
        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return PrescriptionMapper.mapToPrescriptionDTO(updatedPrescription);
    }
}