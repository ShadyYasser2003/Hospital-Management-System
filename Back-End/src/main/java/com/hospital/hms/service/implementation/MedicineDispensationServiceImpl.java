package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.DispensationStatus;
import com.hospital.hms.dto.MedicineDispensationDto;
import com.hospital.hms.entity.MedicineDispensation;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.Pharmacist;
import com.hospital.hms.entity.Prescription;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.DispensationMapper;
import com.hospital.hms.repository.MedicineDispensationRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.repository.PharmacistRepository;
import com.hospital.hms.repository.PrescriptionRepository;
import com.hospital.hms.service.MedicineDispensationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineDispensationServiceImpl implements MedicineDispensationService {
    private final MedicineDispensationRepository repository;
    private final PrescriptionRepository prescriptionRepository;
    private final PharmacistRepository pharmacistRepository;
    private final PatientRepository patientRepository;

    @Override
    public MedicineDispensationDto createNewMedicineDispensation(MedicineDispensationDto dispensationDto) {
        MedicineDispensation dispensation = DispensationMapper.mapFromDto(dispensationDto);
        return DispensationMapper.mapToDto(repository.save(dispensation));
    }

    @Override
    public MedicineDispensationDto updateMedicineDispensation(Long id, MedicineDispensationDto dispensationDto) {
        MedicineDispensation existingDispensation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine Dispensation not found with id: " + id));


        if (dispensationDto.getDispensedQuantity() != 0) {
            existingDispensation.setDispensedQuantity(dispensationDto.getDispensedQuantity());
        }
        if (dispensationDto.getDispensedDate() != null) {
            existingDispensation.setDispensedDate(
                com.hospital.hms.config.DateUtils.parse(dispensationDto.getDispensedDate()));
        }
        if (dispensationDto.getStatus() != null) {
            existingDispensation.setStatus(DispensationStatus.valueOf(dispensationDto.getStatus()));
        }
        if (dispensationDto.getCharges() != 0.0) {
            existingDispensation.setCharges(dispensationDto.getCharges());
        }
        return DispensationMapper.mapToDto(repository.save(existingDispensation));
    }

    @Override
    public MedicineDispensationDto getMedicineDispensationById(Long id) {
        MedicineDispensation existingDispensation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine Dispensation not found with id: " + id));

        return DispensationMapper.mapToDto(existingDispensation);
    }

    @Override
    public List<MedicineDispensationDto> getAllMedicineDispensations() {
        return repository.findAll().stream().map(DispensationMapper::mapToDto).toList();
    }

    @Override
    public void deleteMedicineDispensation(Long id) {
        MedicineDispensation existingDispensation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine Dispensation not found with id: " + id));
        repository.delete(existingDispensation);
    }

    @Override
    public List<MedicineDispensationDto> getDispensationByPrescription(Long prescriptionId) {
        Prescription prescription= prescriptionRepository.findById(prescriptionId)
                .orElseThrow(()->new RuntimeException("Prescription not found with id: "+prescriptionId));
        List<MedicineDispensation> dispensations= prescription.getDispensations();
        if(dispensations.isEmpty()){
            return Collections.emptyList();
        }
        return dispensations.stream().map(DispensationMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<MedicineDispensationDto> getDispensationByPharmacist(Long pharmacistId) {
        Pharmacist pharmacist= pharmacistRepository.findById(pharmacistId)
                .orElseThrow(()->new RuntimeException("Pharmacist not found with id: "+pharmacistId));
        List<MedicineDispensation> dispensations= pharmacist.getMedicineDispensationList();
        if(dispensations.isEmpty()){
            return Collections.emptyList();
        }
        return dispensations.stream().map(DispensationMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<MedicineDispensationDto> getDispensationByPatient(Long patientId) {
        Patient patient= patientRepository.findById(patientId)
                .orElseThrow(()->new RuntimeException("Patient not found with id: "+patientId));
        List<MedicineDispensation> dispensations= patient.getDispensationList();
        if(dispensations.isEmpty()){
            return Collections.emptyList();
        }
        return dispensations.stream().map(DispensationMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    public MedicineDispensationDto updateDispensationStatus(Long id, String status) {
        MedicineDispensation dispensation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine Dispensation not found with id: " + id));
        if(status.trim().isBlank()||status.isEmpty()){
            throw new RuntimeException("Invalid status: Empty String");
        }
        dispensation.setStatus(DispensationStatus.valueOf(status.trim()));
        MedicineDispensation saved= repository.save(dispensation);
        return DispensationMapper.mapToDto(saved);
    }

    @Override
    public MedicineDispensationDto cancelDispensation(Long id) {
        MedicineDispensation dispensation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine Dispensation not found with id: " + id));
        dispensation.setStatus(DispensationStatus.CANCELLED);
        return DispensationMapper.mapToDto(repository.save(dispensation));
    }


    @Override
    public List<MedicineDispensationDto> getDispensationByDateRange(LocalDate start, LocalDate end) {
        List<MedicineDispensation> dispensations= repository.findAllByOrderByDispensedDateAsc();
        if(dispensations.isEmpty()){
            return Collections.emptyList();
        }
        List<MedicineDispensationDto> range = new ArrayList<>();
        if(start.isBefore(end) || start.equals(end)) {
            for (MedicineDispensation dispensation : dispensations) {
                LocalDate dispensedDate = dispensation.getDispensedDate();
                if ((dispensedDate.isAfter(start) || dispensedDate.equals(start)) &&
                        (dispensedDate.isBefore(end) || dispensedDate.equals(end))) {
                    range.add(DispensationMapper.mapToDto(dispensation));
                } else if (dispensedDate.isAfter(end)) {
                    break;
                }
            }
        }else {
            throw new RuntimeException("Invalid date range: start date can't be after end date");
        }
        return range;
    }

    @Override
    public List<MedicineDispensationDto> getDispensationByStatus(String status) {
        if(status.trim().isBlank()||status.isEmpty()){
            throw new RuntimeException("Invalid status: Empty String");
        }
        List<MedicineDispensation> dispensations= repository.findByStatus(DispensationStatus.valueOf(status.trim().toUpperCase()));
        if ((dispensations.isEmpty())){
            return Collections.emptyList();
        }
        return dispensations.stream().map(DispensationMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<MedicineDispensationDto> getPendingDispensations() {
        List<MedicineDispensation> dispensations= repository.findAll();
        if(dispensations.isEmpty()){
            return Collections.emptyList();
        }
        List<MedicineDispensationDto> pending= new ArrayList<>();
        for(MedicineDispensation dispensation: dispensations){
            if(dispensation.getStatus().equals(DispensationStatus.PENDING)){
                pending.add(DispensationMapper.mapToDto(dispensation));
            }
        }
        return pending;
    }

    @Override
    public List<MedicineDispensationDto> getTodayDispensations() {
        List<MedicineDispensation> dispensations= repository.findAll();
        if(dispensations.isEmpty()){
            return Collections.emptyList();
        }
        List<MedicineDispensationDto> today= new ArrayList<>();
        for(MedicineDispensation dispensation: dispensations){
            if(dispensation.getDispensedDate().equals(LocalDate.now())){
                today.add(DispensationMapper.mapToDto(dispensation));
            }
        }
        return today;
    }

    @Override
    public Double getTotalChargesByPatient(Long patientId, LocalDate start, LocalDate end) {
        Patient patient= patientRepository.findById(patientId)
                .orElseThrow(()->new UserNotFoundException("Patient not found with id: "+patientId));
        List<MedicineDispensation> patientDispensations= patient.getDispensationList();
        if(patientDispensations.isEmpty()){
            return 0.0;
        }
        Double totalCosts = 0.0;
        //validate date range
        if(start.isBefore(end) || start.equals(end)) {
            for (MedicineDispensation dispensation : patientDispensations) {
                LocalDate dispensedDate = dispensation.getDispensedDate();
                if ((dispensedDate.isAfter(start) || dispensedDate.equals(start)) &&
                        (dispensedDate.isBefore(end) || dispensedDate.equals(end))) {
                    if (dispensation.getStatus().equals(DispensationStatus.PENDING)) {
                        totalCosts += dispensation.getCharges();
                    }
                } else if (dispensedDate.isAfter(end)) {
                    break;
                }
            }
        }else {
            throw new RuntimeException("Invalid date range: start date can't be after end date");
        }
        return totalCosts;
    }
}
