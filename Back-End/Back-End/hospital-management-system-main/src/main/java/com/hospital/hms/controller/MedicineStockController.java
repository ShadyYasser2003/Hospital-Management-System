package com.hospital.hms.controller;

import com.hospital.hms.dto.MedicineStockDto;
import com.hospital.hms.service.MedicineStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/medicine-stock")
public class MedicineStockController {
    private final MedicineStockService service;
    @GetMapping
    public ResponseEntity<List<MedicineStockDto>> getAllStocks(){
        return ResponseEntity.ok(service.getAllMedicineStocks());
    }
    @GetMapping("/{id}")
    public ResponseEntity<MedicineStockDto> getStockById(@PathVariable Long id){
        return ResponseEntity.ok(service.getMedicineStockById(id));
    }
    @PostMapping
    public ResponseEntity<MedicineStockDto> addMedicineStock(@RequestBody MedicineStockDto stockDto){
        return new ResponseEntity<>(service.createMedicineStock(stockDto), HttpStatus.CREATED);
    }
    @PutMapping("/{id}/update")
    public ResponseEntity<MedicineStockDto> updateMedicineStock(
            @PathVariable Long id,
            @RequestParam String operation,
            @RequestParam int quantity){
        return ResponseEntity.ok(service.updateMedicineStock(id,operation,quantity));
    }
    @PutMapping("/{id}")
    public ResponseEntity<MedicineStockDto> updateMedicineStockFull(
            @PathVariable Long id,
            @RequestBody MedicineStockDto stockDto){
        return ResponseEntity.ok(service.updateMedicineStockFull(id, stockDto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStock(@PathVariable Long id){
        service.deleteMedicineStock(id);
        return new ResponseEntity<>("Stock deleted successfully with id: "+id,HttpStatus.OK);
    }
    @GetMapping("/low-stock")
    public ResponseEntity<List<MedicineStockDto>> getLowStockMedicine(){
        return ResponseEntity.ok(service.getLowStockMedicines());
    }
    @GetMapping("/medicine-stock/{medicineId}")
    public ResponseEntity<List<MedicineStockDto>> getStocksOfMedicine(@PathVariable Long medicineId){
        return ResponseEntity.ok(service.getALlStocksOfMedicine(medicineId));
    }
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<MedicineStockDto>> getExpiringSoonStocks(@RequestParam(defaultValue = "30") int days){
        if (days <= 0 || days > 365) {
            throw new IllegalArgumentException("Days must be between 1 and 365");
        }
        return ResponseEntity.ok(service.getExpiringMedicineStock(days));
    }
}
