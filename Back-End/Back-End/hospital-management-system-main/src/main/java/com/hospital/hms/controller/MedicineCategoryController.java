package com.hospital.hms.controller;

import com.hospital.hms.dto.MedicineCategoryDto;
import com.hospital.hms.dto.MedicineDto;
import com.hospital.hms.service.MedicineCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicine-categories")
@RequiredArgsConstructor
public class MedicineCategoryController {
    private final MedicineCategoryService service;
    @PostMapping
    public ResponseEntity<MedicineCategoryDto> createMedicineCategory(@RequestBody MedicineCategoryDto categoryDto){
        return new ResponseEntity<>(service.createNewMedicineCategory(categoryDto), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<MedicineCategoryDto> updateMedicineCategory(@PathVariable Long id,
                                                                      @RequestBody MedicineCategoryDto categoryDto){
        return ResponseEntity.ok(service.updateMedicineCategory(id, categoryDto));
    }
    @GetMapping("/{id}")
    public ResponseEntity<MedicineCategoryDto> getMedicineCategoryById(@PathVariable Long id){
        return ResponseEntity.ok(service.getMedicineCategoryById(id));
    }
    @GetMapping
    public ResponseEntity<List<MedicineCategoryDto>> getAllMedicineCategories(){
        return ResponseEntity.ok(service.getAllMedicineCategories());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedicineCategory(@PathVariable Long id){
        service.deleteMedicineCategory(id);
        return ResponseEntity.ok("Medicine category deleted successfully");
    }
    @GetMapping("/{id}/medicines")
    public ResponseEntity<List<MedicineDto>> getMedicineByCategory(@PathVariable("id") Long categoryId){
        return ResponseEntity.ok(service.getMedicineByCategory(categoryId));
    }
}
