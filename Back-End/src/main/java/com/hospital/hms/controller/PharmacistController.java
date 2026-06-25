package com.hospital.hms.controller;


import com.hospital.hms.dto.PharmacistDto;
import com.hospital.hms.service.PharmacistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacists")
@RequiredArgsConstructor
public class PharmacistController {
    private final PharmacistService service;

    
    @GetMapping("/{id}")
    public ResponseEntity<PharmacistDto> getPharmacistById(@PathVariable Long id){
        return ResponseEntity.ok(service.getPharmacistById(id));
    }
    @GetMapping
    public ResponseEntity<List<PharmacistDto>> getAllPharmacist(){
        return ResponseEntity.ok(service.getAllPharmacists());
    }
    @PutMapping("/{id}")
    public ResponseEntity<PharmacistDto> updatePharmacist(@PathVariable Long id,@RequestBody PharmacistDto pharmacistDto){
        return ResponseEntity.ok(service.updatePharmacist(id, pharmacistDto));
    }
    @DeleteMapping("/{id}")
    public void deletePharmacist(@PathVariable Long id){
        service.deletePharmacist(id);
    }
    @GetMapping("/name")
    public ResponseEntity<List<PharmacistDto>> getPharmacistByName(@RequestParam String name){
        return ResponseEntity.ok(service.getPharmacistByName(name));
    }
    @GetMapping("/nationalId")
    public ResponseEntity<PharmacistDto> getPharmacistByNationalId(@RequestParam String nationalId){
        return ResponseEntity.ok(service.getPharmacistByNationalId(nationalId));
    }
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<PharmacistDto>> getPharmacistByDepartment(@PathVariable Long departmentId){
        return ResponseEntity.ok(service.findPharmacistsByDepartment(departmentId));
    }
    @PostMapping
    public ResponseEntity<PharmacistDto> createPharmacist(@RequestBody PharmacistDto pharmacistDto){
        return ResponseEntity.ok(service.createPharmacist(pharmacistDto));
    }
}