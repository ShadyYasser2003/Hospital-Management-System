package com.hospital.hms.controller;

import com.hospital.hms.dto.ExternalHospitalDto;
import com.hospital.hms.service.ExternalHospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/external-hospitals")
@RequiredArgsConstructor
public class ExternalHospitalController {

    private final ExternalHospitalService externalHospitalService;

    @GetMapping
    public ResponseEntity<List<ExternalHospitalDto>> getAllHospitals() {
        return ResponseEntity.ok(externalHospitalService.getAllHospitals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExternalHospitalDto> getHospitalById(@PathVariable Long id) {
        return ResponseEntity.ok(externalHospitalService.getHospitalById(id));
    }

    @PostMapping
    public ResponseEntity<ExternalHospitalDto> createHospital(
            @RequestBody ExternalHospitalDto dto) {
        return new ResponseEntity<>(
                externalHospitalService.createHospital(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExternalHospitalDto> updateHospital(
            @PathVariable Long id,
            @RequestBody ExternalHospitalDto dto) {
        return ResponseEntity.ok(externalHospitalService.updateHospital(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        externalHospitalService.deleteHospital(id);
        return ResponseEntity.noContent().build();
    }
}