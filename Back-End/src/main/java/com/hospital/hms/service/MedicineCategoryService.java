package com.hospital.hms.service;

import com.hospital.hms.dto.MedicineCategoryDto;
import com.hospital.hms.dto.MedicineDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MedicineCategoryService {
    MedicineCategoryDto createNewMedicineCategory(MedicineCategoryDto categoryDto);
    MedicineCategoryDto updateMedicineCategory(Long id, MedicineCategoryDto categoryDto);
    MedicineCategoryDto getMedicineCategoryById(Long id);
    List<MedicineCategoryDto> getAllMedicineCategories();
    void deleteMedicineCategory(Long id);
    List<MedicineDto> getMedicineByCategory(Long categoryId);
}
