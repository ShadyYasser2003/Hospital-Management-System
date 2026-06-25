package com.hospital.hms.controller;

import com.hospital.hms.dto.RadiologyOrderDto;
import com.hospital.hms.service.RadiologyOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/radiology-orders")
@RequiredArgsConstructor
public class RadiologyOrderController {
    private final RadiologyOrderService radiologyOrderService;

    @GetMapping
    public ResponseEntity<List<RadiologyOrderDto>> getAllOrders() {
        return ResponseEntity.ok(radiologyOrderService.getAllOrders());
    }


    @GetMapping("/{id}")
    public ResponseEntity<RadiologyOrderDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(radiologyOrderService.getOrderById(id));
    }


    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RadiologyOrderDto>> getOrdersByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(radiologyOrderService.getOrdersByPatient(patientId));
    }


    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<RadiologyOrderDto>> getOrdersByDoctor(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(radiologyOrderService.getOrdersByDoctor(doctorId));
    }


    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<RadiologyOrderDto>> getOrdersByTechnician(
            @PathVariable Long technicianId) {
        return ResponseEntity.ok(radiologyOrderService.getOrdersByTechnician(technicianId));
    }


    @GetMapping("/status")
    public ResponseEntity<List<RadiologyOrderDto>> getOrdersByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(radiologyOrderService.getOrdersByStatus(status));
    }


    @GetMapping("/type")
    public ResponseEntity<List<RadiologyOrderDto>> getOrdersByType(
            @RequestParam String orderType) {
        return ResponseEntity.ok(radiologyOrderService.getOrdersByType(orderType));
    }


    @GetMapping("/critical")
    public ResponseEntity<List<RadiologyOrderDto>> getCriticalOrders() {
        return ResponseEntity.ok(radiologyOrderService.getCriticalOrders());
    }


    @GetMapping("/patient/{patientId}/status")
    public ResponseEntity<List<RadiologyOrderDto>> getOrdersByPatientAndStatus(
            @PathVariable Long patientId,
            @RequestParam String status) {
        return ResponseEntity.ok(
                radiologyOrderService.getOrdersByPatientAndStatus(patientId, status));
    }


    @PostMapping
    public ResponseEntity<RadiologyOrderDto> createOrder(
            @RequestBody RadiologyOrderDto dto) {
        return new ResponseEntity<>(
                radiologyOrderService.createOrder(dto), HttpStatus.CREATED);
    }


    @PutMapping("/{id}")
    public ResponseEntity<RadiologyOrderDto> updateOrder(
            @PathVariable Long id,
            @RequestBody RadiologyOrderDto dto) {
        return ResponseEntity.ok(radiologyOrderService.updateOrder(id, dto));
    }



    @PatchMapping("/{id}/assign-technician")
    public ResponseEntity<RadiologyOrderDto> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        return ResponseEntity.ok(radiologyOrderService.assignTechnician(id, technicianId));
    }


    @PatchMapping("/{id}/schedule")
    public ResponseEntity<RadiologyOrderDto> scheduleOrder(
            @PathVariable Long id,
            @RequestParam String scheduledAt) {
        return ResponseEntity.ok(radiologyOrderService.scheduleOrder(id, scheduledAt));
    }



    @PatchMapping("/{id}/report")
    public ResponseEntity<RadiologyOrderDto> enterReport(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String reportFindings = (String) body.get("reportFindings");
        String impression     = (String) body.get("impression");
        String imageUrl       = (String) body.get("imageUrl");
        String notes          = (String) body.get("notes");
        Boolean isCritical    = body.get("isCritical") != null
                ? (Boolean) body.get("isCritical") : false;
        return ResponseEntity.ok(
                radiologyOrderService.enterReport(id, reportFindings, impression,
                        imageUrl, isCritical, notes));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        radiologyOrderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

}
