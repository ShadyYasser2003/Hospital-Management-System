package com.hospital.hms.controller;

import com.hospital.hms.dto.TestRequestDTO;
import com.hospital.hms.service.TestRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-requests")
@RequiredArgsConstructor
public class TestRequestController {

    private final TestRequestService testRequestService;

    @PostMapping
    public ResponseEntity<TestRequestDTO> create(@RequestBody TestRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(testRequestService.createTestRequest(dto));
    }

    @GetMapping
    public ResponseEntity<List<TestRequestDTO>> getAll() {
        return ResponseEntity.ok(testRequestService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestRequestDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(testRequestService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TestRequestDTO>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(testRequestService.getByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<TestRequestDTO>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(testRequestService.getByDoctor(doctorId));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<Page<TestRequestDTO>> getByTechnician(
            @PathVariable Long technicianId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(testRequestService.getByTechnician(
                technicianId, PageRequest.of(page, size, Sort.by("requestedAt").descending())));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TestRequestDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(testRequestService.getByStatus(status));
    }

    @PutMapping("/{id}/assign/{technicianId}")
    public ResponseEntity<TestRequestDTO> assignTechnician(
            @PathVariable Long id, @PathVariable Long technicianId) {
        return ResponseEntity.ok(testRequestService.assignTechnician(id, technicianId));
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<TestRequestDTO> acknowledge(@PathVariable Long id) {
        return ResponseEntity.ok(testRequestService.acknowledge(id));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<TestRequestDTO> start(@PathVariable Long id) {
        return ResponseEntity.ok(testRequestService.startProcessing(id));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<TestRequestDTO> complete(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        String results   = (String) body.get("results");
        String reportUrl = (String) body.get("reportUrl");
        Double charges   = body.get("charges") != null
                ? Double.parseDouble(body.get("charges").toString()) : null;
        return ResponseEntity.ok(testRequestService.complete(id, results, reportUrl, charges));
    }

    @PostMapping("/{id}/upload-report")
    public ResponseEntity<Map<String, String>> uploadReport(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(Map.of("reportUrl", testRequestService.uploadReport(id, file)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<TestRequestDTO> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(testRequestService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        testRequestService.deleteTestRequest(id);
        return ResponseEntity.ok("Test request deleted");
    }
}
