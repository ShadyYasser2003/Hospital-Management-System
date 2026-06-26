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
    private final MedicineRepository medicineRepository;
    private final PharmacistRepository pharmacistRepository;
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Prescription notification skipped for user {}: {}", recipientId, e.getMessage()); }
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
    public PrescriptionDTO createPrescription(PrescriptionDTO prescriptionDTO) {
        Patient patient = patientRepository.findById(prescriptionDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(prescriptionDTO.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setPatientName(patient.getName());
        prescription.setDoctor(doctor);
        prescription.setDoctorName(doctor.getName());
        prescription.setPrescriptionDate(LocalDate.now());
        prescription.setNotes(prescriptionDTO.getNotes());
        prescription.setStatus(PrescriptionStatus.PENDING);
        prescription.setUpdatedAt(LocalDateTime.now());
        for(PrescriptionItemDTO item: prescriptionDTO.getItems()){
            PrescriptionItem item1= new PrescriptionItem();
            Medicine medicine= medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(()-> new RuntimeException("Medicine not found with id: "+item.getMedicineId()));
            item1.setMedicine(medicine);
            item1.setMedicineName(medicine.getGenericName());
            item1.setDosage(item.getDosage());
            item1.setFrequency(item.getFrequency());
            item1.setDuration(item.getDuration());
            item1.setQuantity(item.getQuantity());
            item1.setInstructions(item.getInstructions());
            item1.setDispensed(item.getDispensed());
            item1.setDispensedQuantity(0);
            item1.setDispensed(false);
            prescription.addPrescriptionItem(item1);
        }

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Notify patient
        notify(patient.getId(),
                "Prescription Created",
                "Dr. " + doctor.getName() + " has issued a new prescription for you.",
                NotificationType.PRESCRIPTION_CREATED,
                "/patient/prescriptions");

        // Notify all pharmacists so they can prepare the prescription
        try {
            pharmacistRepository.findAll().forEach(pharmacist ->
                notify(pharmacist.getId(),
                        "New Prescription Pending",
                        "Dr. " + doctor.getName() + " issued a prescription for patient " +
                        patient.getName() + ". Please review and dispense.",
                        NotificationType.PRESCRIPTION_CREATED,
                        "/pharmacist/prescriptions"));
        } catch (Exception e) {
            log.warn("Could not notify pharmacists about prescription: {}", e.getMessage());
        }

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
        Prescription updated = prescriptionRepository.save(prescription);

        // Notify patient that prescription was dispensed
        if (prescription.getPatient() != null) {
            notify(prescription.getPatient().getId(),
                    "Prescription Dispensed",
                    "Your prescription has been dispensed at the pharmacy.",
                    NotificationType.PRESCRIPTION_DISPENSED,
                    "/patient/prescriptions");
        }

        // Notify the doctor that prescription was dispensed
        if (prescription.getDoctor() != null) {
            notify(prescription.getDoctor().getId(),
                    "Prescription Dispensed",
                    "Prescription for patient " + prescription.getPatientName() + " has been dispensed.",
                    NotificationType.PRESCRIPTION_DISPENSED,
                    "/doctor/prescriptions");
        }

        // Auto-add medication charge to patient's invoice
        if (prescription.getPatient() != null) {
            try {
                double totalCharge = updated.getItems().stream()
                        .mapToDouble(item -> {
                            // Estimate cost: quantity × a nominal unit price per item
                            // Use 10.0 as default if no price data available
                            return item.getQuantity() != null ? item.getQuantity() * 10.0 : 10.0;
                        }).sum();

                String description = "Prescription #" + id + " — " +
                        updated.getItems().stream()
                                .map(i -> i.getMedicineName() != null ? i.getMedicineName() : "Medicine")
                                .limit(3)
                                .reduce((a, b) -> a + ", " + b).orElse("Medications");

                if (totalCharge > 0) {
                    invoiceService.addMedicationCharge(
                            prescription.getPatient().getId(), id, description, totalCharge);
                }
            } catch (Exception e) {
                log.warn("Could not add medication charge to invoice for prescription {}: {}",
                        id, e.getMessage());
            }
        }

        return PrescriptionMapper.mapToPrescriptionDTO(updated);
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