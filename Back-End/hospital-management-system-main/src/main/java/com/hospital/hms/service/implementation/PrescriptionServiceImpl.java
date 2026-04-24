package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.PrescriptionStatus;
import com.hospital.hms.dto.PrescriptionDTO;
import com.hospital.hms.dto.PrescriptionItemDTO;
import com.hospital.hms.entity.*;
import com.hospital.hms.mapper.PrescriptionItemMapper;
import com.hospital.hms.mapper.PrescriptionMapper;
import com.hospital.hms.repository.*;
import com.hospital.hms.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository itemRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MedicineRepository medicineRepository;

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
        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return PrescriptionMapper.mapToPrescriptionDTO(updatedPrescription);
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