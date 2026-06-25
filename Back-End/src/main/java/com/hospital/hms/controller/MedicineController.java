package com.hospital.hms.controller;

import com.hospital.hms.dto.MedicineDto;
import com.hospital.hms.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medicine")
public class MedicineController {
    private final MedicineService service;
    @PostMapping
    public ResponseEntity<MedicineDto> createMedicine(@RequestBody MedicineDto medicineDto){
        return new ResponseEntity<>(service.createNewMedicine(medicineDto), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<MedicineDto> updateMedicine(@PathVariable Long id,@RequestBody MedicineDto medicineDto){
        return ResponseEntity.ok(service.updateMedicine(id, medicineDto));
    }
    @GetMapping("/{id}")
    public ResponseEntity<MedicineDto> getMedicineById(@PathVariable Long id){
        return ResponseEntity.ok(service.getMedicineById(id));
    }
    @GetMapping
    public ResponseEntity<List<MedicineDto>> getAllMedicine(){
        return ResponseEntity.ok(service.getAllMedicine());
    }
    @DeleteMapping("/{id}")
    public void deleteMedicine(@PathVariable Long id){
        service.deleteMedicine(id);
    }
    @GetMapping("/search")//keyword could be name field or generic name
    public ResponseEntity<MedicineDto> getMedicineByGenericName(@RequestParam String keyword){
        return ResponseEntity.ok(service.searchMedicineByGenericName(keyword));
    }
    @PutMapping("/{id}/status")
    public ResponseEntity<MedicineDto> updateMedicineStatus(@PathVariable Long id, @RequestBody(required = false) MedicineDto body) {
        // recalculate status from stock and return updated MedicineDto
        service.getMedicineStatus(id);
        return ResponseEntity.ok(service.getMedicineById(id));
    }
    @PatchMapping("/{id}/categories")
    public ResponseEntity<MedicineDto> addMedicineToCategories(@PathVariable Long id, @RequestBody List<Long> categories) {
        return ResponseEntity.ok(service.addMedicineToCategories(id,categories));
    }
    @PatchMapping("/{medicineId}/categories/{categoryId}/remove")
    public void removeMedicineFromCategory(@PathVariable Long medicineId, @PathVariable Long categoryId) {
        service.removeMedicineFromCategory(medicineId,categoryId);
    }
}
