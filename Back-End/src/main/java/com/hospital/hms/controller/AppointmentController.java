package com.hospital.hms.controller;

import com.hospital.hms.dto.AppointmentDTO;
import com.hospital.hms.service.AppointmentService;
import com.hospital.hms.service.implementation.AppointmentServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService ;

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByPatient(@PathVariable Long patientId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatient(patientId);
        return ResponseEntity.ok(appointments);
    }
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDoctor(doctorId);
        return ResponseEntity.ok(appointments);
    }

    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO createdAppointment = appointmentService.createAppointment(appointmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAppointment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO updatedAppointment = appointmentService.updateAppointment(id, appointmentDTO);
        return ResponseEntity.ok(updatedAppointment);
    }
    @PutMapping("/{id}/confirm")
    public ResponseEntity<AppointmentDTO> confirmAppointment(@PathVariable Long id) {
        AppointmentDTO confirmedAppointment = appointmentService.confirmAppointment(id);
        return ResponseEntity.ok(confirmedAppointment);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<AppointmentDTO> completeAppointment(@PathVariable Long id) {
        AppointmentDTO completedAppointment = appointmentService.completeAppointment(id);
        return ResponseEntity.ok(completedAppointment);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentDTO> cancelAppointment(@PathVariable Long id) {
        AppointmentDTO cancelledAppointment = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(cancelledAppointment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok("Appointment deleted successfully");
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByStatus(@PathVariable String status) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDate(date);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDepartment(@PathVariable String department) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDepartment(department);
        return ResponseEntity.ok(appointments);
    }
}
