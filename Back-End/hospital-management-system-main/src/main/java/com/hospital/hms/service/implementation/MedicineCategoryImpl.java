package com.hospital.hms.service.implementation;

import com.hospital.hms.dto.MedicineCategoryDto;
import com.hospital.hms.dto.MedicineDto;
import com.hospital.hms.entity.Medicine;
import com.hospital.hms.entity.MedicineCategory;
import com.hospital.hms.exception.MedicineCategoryNotFound;
import com.hospital.hms.mapper.MedicineCategoryMapper;
import com.hospital.hms.mapper.MedicineMapper;
import com.hospital.hms.repository.MedicineCategoryRepository;
import com.hospital.hms.repository.MedicineRepository;
import com.hospital.hms.service.MedicineCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
@Service
@RequiredArgsConstructor
public class MedicineCategoryImpl implements MedicineCategoryService {
    private final MedicineCategoryRepository repository;
    private final MedicineRepository medicineRepository;
    @Override
    public MedicineCategoryDto createNewMedicineCategory(MedicineCategoryDto categoryDto) {
        if(repository.findByNameContainingIgnoreCase(categoryDto.getName()).isPresent() && categoryDto.getName() != null){
            throw new RuntimeException("Name already used, please pick another different but unique name");
        }
        MedicineCategory category= repository.save(MedicineCategoryMapper.mapFromDto(categoryDto));
        return MedicineCategoryMapper.mapToDto(category);
    }


    @Override
    public MedicineCategoryDto updateMedicineCategory(Long id, MedicineCategoryDto categoryDto) {
        MedicineCategory existingCategory = repository.findById(id)
                .orElseThrow(() -> new MedicineCategoryNotFound("Category not found with id: " + id));

        if (categoryDto.getName() != null &&
                !categoryDto.getName().equals(existingCategory.getName())) {
            if (repository.findByNameContainingIgnoreCase(categoryDto.getName()).isPresent()) {
                throw new RuntimeException("Name already used, please pick another different but unique name");
            }
            existingCategory.setName(categoryDto.getName());
        }
        if(categoryDto.getDescription()!= null){
            existingCategory.setDescription(categoryDto.getDescription());
        }
        MedicineCategory savedCategory= repository.save(existingCategory);
        return MedicineCategoryMapper.mapToDto(savedCategory);
    }

    @Override
    public MedicineCategoryDto getMedicineCategoryById(Long id) {
        MedicineCategory existingCategory = repository.findById(id)
                .orElseThrow(() -> new MedicineCategoryNotFound("Category not found with id: " + id));

        return MedicineCategoryMapper.mapToDto(existingCategory);
    }

    @Override
    public List<MedicineCategoryDto> getAllMedicineCategories() {
        return repository.findAll().stream()
                .map(MedicineCategoryMapper::mapToDto).toList();
    }

    @Override
    public void deleteMedicineCategory(Long id) {
        MedicineCategory existingCategory = repository.findById(id)
                .orElseThrow(() -> new MedicineCategoryNotFound("Category not found with id: " + id));
        repository.delete(existingCategory);
    }

    @Override
    public List<MedicineDto> getMedicineByCategory(Long categoryId) {
        MedicineCategory existingCategory = repository.findById(categoryId)
                .orElseThrow(() -> new MedicineCategoryNotFound("Category not found with id: " + categoryId));
        List<Medicine> medicines= existingCategory.getMedicineList();
        if(medicines == null){
            return Collections.emptyList();
        }
        return medicines.stream().map(MedicineMapper::mapToMedicineDto).toList();
    }
}
