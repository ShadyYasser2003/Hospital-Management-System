package com.hospital.hms.controller;

import com.hospital.hms.dto.TechnicianDto;
import com.hospital.hms.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;

    @PostMapping
    public ResponseEntity<TechnicianDto> create(@RequestBody TechnicianDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(technicianService.createTechnician(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TechnicianDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<TechnicianDto>> getAll() {
        return ResponseEntity.ok(technicianService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TechnicianDto> update(@PathVariable Long id, @RequestBody TechnicianDto dto) {
        return ResponseEntity.ok(technicianService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        technicianService.delete(id);
        return ResponseEntity.ok("Technician deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<TechnicianDto>> search(@RequestParam String name) {
        return ResponseEntity.ok(technicianService.searchByName(name));
    }

    @GetMapping("/national-id/{nationalId}")
    public ResponseEntity<TechnicianDto> getByNationalId(@PathVariable String nationalId) {
        return ResponseEntity.ok(technicianService.getByNationalId(nationalId));
    }
}
