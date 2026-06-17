package com.hospital.hms.controller;

import com.hospital.hms.dto.MedicineDto;
import com.hospital.hms.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<String> deleteMedicine(@PathVariable Long id){
        service.deleteMedicine(id);
        return ResponseEntity.ok("Medicine deleted successfully");
    }
    @GetMapping("/search") // keyword can match name or generic name
    public ResponseEntity<List<MedicineDto>> getMedicineByGenericName(@RequestParam String keyword) {
        return ResponseEntity.ok(service.searchMedicines(keyword));
    }
    @PutMapping("/{id}/status")
    public ResponseEntity<MedicineDto> updateMedicineStatus(
            @PathVariable Long id,
            @RequestBody(required = false) MedicineDto body) {
        // If a status is explicitly provided in the body, apply it directly.
        // Otherwise, recalculate from current stock levels.
        if (body != null && body.getStatus() != null && !body.getStatus().isBlank()) {
            MedicineDto updated = service.updateMedicine(id, body);
            return ResponseEntity.ok(updated);
        }
        // Recalculate from stock and return the refreshed DTO
        service.getMedicineStatus(id);
        return ResponseEntity.ok(service.getMedicineById(id));
    }
    @PatchMapping("/{id}/categories")
    public ResponseEntity<MedicineDto> addMedicineToCategories(@PathVariable Long id, @RequestBody java.util.Map<String, Object> body) {
        // Accept both raw list and { categoryIds: [...] } wrapper
        Object raw = body.get("categoryIds");
        List<Long> categories;
        if (raw instanceof java.util.List<?> list) {
            categories = list.stream()
                    .map(o -> Long.parseLong(o.toString()))
                    .toList();
        } else {
            categories = List.of();
        }
        return ResponseEntity.ok(service.addMedicineToCategories(id, categories));
    }
    @PatchMapping("/{medicineId}/categories/{categoryId}/remove")
    public void removeMedicineFromCategory(@PathVariable Long medicineId, @PathVariable Long categoryId) {
        service.removeMedicineFromCategory(medicineId,categoryId);
    }
}
