package com.hospital.hms.service;

import com.hospital.hms.Enum.MedicineStatus;
import com.hospital.hms.dto.MedicineCategoryDto;
import com.hospital.hms.dto.MedicineDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MedicineService {
    MedicineDto createNewMedicine(MedicineDto medicineDto);
    MedicineDto updateMedicine(Long id, MedicineDto medicineDto);
    MedicineDto getMedicineById(Long id);
    List<MedicineDto> getAllMedicine();
    void deleteMedicine(Long id);
    String getMedicineStatus(Long id) ;
    MedicineDto searchMedicineByGenericName(String keyword); //keyword could be name field or generic name field
    MedicineDto addMedicineToCategories(Long medicineId, List<Long> categories);
    void removeMedicineFromCategory(Long medicineId, Long categoryId);
}
