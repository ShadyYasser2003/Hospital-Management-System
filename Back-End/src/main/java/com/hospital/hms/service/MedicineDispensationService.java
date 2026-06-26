package com.hospital.hms.service;

import com.hospital.hms.dto.MedicineDispensationDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public interface MedicineDispensationService {
    MedicineDispensationDto createNewMedicineDispensation(MedicineDispensationDto dispensationDto);
    MedicineDispensationDto updateMedicineDispensation(Long id, MedicineDispensationDto dispensationDto);
    MedicineDispensationDto getMedicineDispensationById(Long id);
    List<MedicineDispensationDto> getAllMedicineDispensations();
    void deleteMedicineDispensation(Long id);
    List<MedicineDispensationDto> getDispensationByPrescription(Long prescriptionId);
    List<MedicineDispensationDto> getDispensationByPharmacist(Long pharmacistId);
    List<MedicineDispensationDto> getDispensationByPatient(Long patientId);
    MedicineDispensationDto updateDispensationStatus(Long id, String status);
    MedicineDispensationDto cancelDispensation(Long id);
    List<MedicineDispensationDto> getDispensationByDateRange(LocalDate start, LocalDate end);
    List<MedicineDispensationDto> getDispensationByStatus(String status);
    List<MedicineDispensationDto> getPendingDispensations();
    List<MedicineDispensationDto> getTodayDispensations();
    Double getTotalChargesByPatient(Long patientId, LocalDate start, LocalDate end);
}
