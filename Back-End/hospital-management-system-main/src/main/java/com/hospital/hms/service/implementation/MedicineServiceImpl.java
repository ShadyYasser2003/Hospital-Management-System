package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.MedicineStatus;
import com.hospital.hms.dto.MedicineCategoryDto;
import com.hospital.hms.dto.MedicineDto;
import com.hospital.hms.entity.Medicine;
import com.hospital.hms.entity.MedicineCategory;
import com.hospital.hms.entity.MedicineStock;
import com.hospital.hms.mapper.MedicineMapper;
import com.hospital.hms.repository.MedicineCategoryRepository;
import com.hospital.hms.repository.MedicineRepository;
import com.hospital.hms.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {
    private final MedicineRepository repository;
    private final MedicineCategoryRepository categoryRepository;
    @Override
    public MedicineDto createNewMedicine(MedicineDto medicineDto) {
        if(repository.findByNameContainingIgnoreCase(medicineDto.getName()).isPresent()){
            throw new RuntimeException("Name already taken, choose another unique name");
        }
        if(repository.findByGenericNameContainingIgnoreCase(medicineDto.getGenericName()).isPresent()){
            throw new RuntimeException("Generic name already taken, choose another unique name");
        }
        medicineDto.setCreatedAt(java.time.LocalDate.now().toString());
        medicineDto.setUpdatedAt(java.time.LocalDate.now().toString());
        Medicine medicine= repository.save(MedicineMapper.mapToMedicine(medicineDto));
        return MedicineMapper.mapToMedicineDto(medicine);
    }

    @Override
    public MedicineDto updateMedicine(Long id, MedicineDto medicineDto) {
        Medicine existingMedicine = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        if (medicineDto.getName() != null ) {
            if (!medicineDto.getName().equals(existingMedicine.getName())) {
                if (repository.findByNameContainingIgnoreCase(medicineDto.getName()).isPresent()) {
                    throw new RuntimeException("Name already used, please pick another different but unique name");
                }
                existingMedicine.setName(medicineDto.getName());
            }
        }
        if (medicineDto.getGenericName() != null ) {
            if (!medicineDto.getGenericName().equals(existingMedicine.getGenericName())) {
                if (repository.findByGenericNameContainingIgnoreCase(medicineDto.getGenericName()).isPresent()) {
                    throw new RuntimeException("Generic name already used, please pick another different but unique name");
                }
                existingMedicine.setGenericName(medicineDto.getGenericName());
            }
        }
        if(medicineDto.getPrescriptionRequired() != null){
            existingMedicine.setPrescriptionRequired(medicineDto.getPrescriptionRequired());
        }
        if(medicineDto.getDescription() != null){
            existingMedicine.setDescription(medicineDto.getDescription());
        }
        if(medicineDto.getSideEffects() != null){
            existingMedicine.setSideEffects(medicineDto.getSideEffects());
        }
        if(medicineDto.getStatus() != null){
            existingMedicine.setStatus(MedicineStatus.valueOf(medicineDto.getStatus().trim().toUpperCase()));
        }
        medicineDto.setUpdatedAt(java.time.LocalDate.now().toString());
        return MedicineMapper.mapToMedicineDto(repository.save(existingMedicine));
    }

    @Override
    public MedicineDto getMedicineById(Long id) {
        Medicine existingMedicine = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        return MedicineMapper.mapToMedicineDto(existingMedicine);
    }

    @Override
    public List<MedicineDto> getAllMedicine() {
        return repository.findAll().stream().map(MedicineMapper::mapToMedicineDto).toList();
    }

    @Override
    public void deleteMedicine(Long id) {
        Medicine existingMedicine = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        repository.delete(existingMedicine);
    }

    @Override
    public String getMedicineStatus(Long id) {
        Medicine medicine= repository.findById(id)
                .orElseThrow(()->new RuntimeException("Medicine not found with id: "+id));
        List<MedicineStock> stocks= medicine.getMedicineStocks();
        Integer stock= 0;
        int minStock= 0;
        boolean expired= false;
        for(MedicineStock s: stocks){
            stock+=s.getCurrentQuantity();
            minStock= Math.max(minStock, s.getReOrderLevel());
            if(java.time.LocalDate.now().isAfter(s.getExpiryDate())){
                expired=true;
            }
        }
        if (stock <= 0) {
            medicine.setStatus(MedicineStatus.OUT_OF_STOCK);
        } else if (stock <= minStock) {
            medicine.setStatus(MedicineStatus.LOW_STOCK);
        } else if(expired){
            medicine.setStatus(MedicineStatus.EXPIRED);
        } else {
            medicine.setStatus(MedicineStatus.IN_STOCK);
        }
        repository.save(medicine);
        return medicine.getStatus().toString();
    }

    @Override
    public MedicineDto searchMedicineByGenericName(String keyword) {//keyword could be name field or generic name field
        if(keyword.isEmpty() || keyword.trim().isBlank()){
            throw new RuntimeException("Invalid String: keyword empty");
        }
        Medicine medicine= repository.findByNameContainingIgnoreCase(keyword.trim())
                .orElse(null);
        if(medicine == null) {
            medicine = repository.findByGenericNameContainingIgnoreCase(keyword.trim())
                    .orElseThrow(() -> new RuntimeException("Medicine not found with name: " + keyword));
        }
        return MedicineMapper.mapToMedicineDto(medicine);
    }


    @Override
    public MedicineDto addMedicineToCategories(Long medicineId, List<Long> categories) {
        Medicine existingMedicine = repository.findById(medicineId)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + medicineId));
        List<MedicineCategory> categoriesToAdd = new ArrayList<>();
        for(Long categoryId: categories){
            MedicineCategory category= categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Medicine category not found with id: " + categoryId));
            if(!existingMedicine.getCategoryList().contains(category)) {
                existingMedicine.getCategoryList().add(category);
            }
            if(!category.getMedicineList().contains(existingMedicine)) {
                category.getMedicineList().add(existingMedicine);
            }
            categoriesToAdd.add(category);
        }
        Medicine savedMedicine = repository.save(existingMedicine);

        categoryRepository.saveAll(categoriesToAdd);
        System.out.println("medicine list size: "+existingMedicine.getCategoryList().size());
        return MedicineMapper.mapToMedicineDto((savedMedicine));
    }

    @Override
    public void removeMedicineFromCategory(Long medicineId, Long categoryId) {
        MedicineCategory category= categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Medicine category not found with id: " + categoryId));
        Medicine existingMedicine = repository.findById(medicineId)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + medicineId));

        existingMedicine.removeCategory(category);
        repository.save(existingMedicine);
        categoryRepository.save(category);
    }


}
