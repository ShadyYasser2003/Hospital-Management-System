package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.Enum.PrescriptionStatus;
import com.hospital.hms.dto.PrescriptionDTO;
import com.hospital.hms.dto.PrescriptionItemDTO;
import com.hospital.hms.entity.*;
import java.util.List;
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
    private final NurseRepository nurseRepository;
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;
    private final AdminRepository adminRepository;

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Prescription notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }

    private void notifyAdmins(String title, String message, String url) {
        try { adminRepository.findAll().forEach(a ->
            notify(a.getId(), title, message, NotificationType.GENERAL, url));
        } catch (Exception e) { log.warn("Admin broadcast skipped: {}", e.getMessage()); }
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
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return prescriptionRepository.findByDoctor(doctor)
                .stream()
                .map(PrescriptionMapper::mapToPrescriptionDTO)
                .toList();
    }

    @Override
    public PrescriptionDTO createPrescription(PrescriptionDTO prescriptionDTO) {
        Patient patient = patientRepository.findById(prescriptionDTO.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Guard: patient must have an open invoice before any operation
        invoiceService.requireOpenInvoice(patient.getId());

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

        // Notify all nurses so they can monitor medication administration
        try {
            nurseRepository.findAll().forEach(nurse ->
                notify(nurse.getId(),
                        "New Prescription Issued",
                        "Dr. " + doctor.getName() + " issued a prescription for patient " +
                        patient.getName() + ". Monitor medication administration.",
                        NotificationType.PRESCRIPTION_CREATED,
                        "/nurse/medications"));
        } catch (Exception e) {
            log.warn("Could not notify nurses about prescription: {}", e.getMessage());
        }

        notifyAdmins("New Prescription Created",
                "Dr. " + doctor.getName() + " issued a prescription for patient " + patient.getName() + ".",
                "/admin/users");

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

        notifyAdmins("Prescription Dispensed",
                "Prescription for patient " + prescription.getPatientName() + " has been dispensed.",
                "/admin/users");

        // Auto-add medication charge to patient's invoice
        if (prescription.getPatient() != null) {
            try {
                double totalCharge = updated.getItems().stream()
                        .mapToDouble(item -> {
                            // Look up real selling price from MedicineStock
                            if (item.getMedicine() != null) {
                                List<MedicineStock> stocks = item.getMedicine().getMedicineStocks();
                                if (stocks != null && !stocks.isEmpty()) {
                                    double unitPrice = stocks.stream()
                                            .filter(s -> s.getSellingPrice() != null && s.getSellingPrice() > 0)
                                            .mapToDouble(MedicineStock::getSellingPrice)
                                            .average()
                                            .orElse(10.0);
                                    return (item.getQuantity() != null ? item.getQuantity() : 1) * unitPrice;
                                }
                            }
                            // Fallback: $10 per unit if no stock price available
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
        Prescription updated = prescriptionRepository.save(prescription);

        if (prescription.getPatient() != null)
            notify(prescription.getPatient().getId(),
                    "Prescription Partially Dispensed",
                    "Part of your prescription has been dispensed. Please follow up with the pharmacy.",
                    NotificationType.PRESCRIPTION_DISPENSED,
                    "/patient/prescriptions");

        if (prescription.getDoctor() != null)
            notify(prescription.getDoctor().getId(),
                    "Prescription Partially Dispensed",
                    "Prescription for patient " + prescription.getPatientName() + " has been partially dispensed.",
                    NotificationType.PRESCRIPTION_DISPENSED,
                    "/doctor/prescriptions");

        notifyAdmins("Prescription Partially Dispensed",
                "Prescription for patient " + prescription.getPatientName() + " was partially dispensed.",
                "/admin/users");

        return PrescriptionMapper.mapToPrescriptionDTO(updated);
    }

    @Override
    public PrescriptionDTO cancelPrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));
        prescription.setStatus(PrescriptionStatus.CANCELLED);
        Prescription updated = prescriptionRepository.save(prescription);

        if (prescription.getPatient() != null)
            notify(prescription.getPatient().getId(),
                    "Prescription Cancelled",
                    "Your prescription has been cancelled. Contact your doctor for more information.",
                    NotificationType.PRESCRIPTION_DISPENSED,
                    "/patient/prescriptions");

        if (prescription.getDoctor() != null)
            notify(prescription.getDoctor().getId(),
                    "Prescription Cancelled",
                    "Prescription for patient " + prescription.getPatientName() + " has been cancelled.",
                    NotificationType.PRESCRIPTION_DISPENSED,
                    "/doctor/prescriptions");

        notifyAdmins("Prescription Cancelled",
                "Prescription for patient " + prescription.getPatientName() + " was cancelled.",
                "/admin/users");

        return PrescriptionMapper.mapToPrescriptionDTO(updated);
    }
}