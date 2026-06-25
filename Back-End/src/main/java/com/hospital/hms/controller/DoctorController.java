package com.hospital.hms.controller;

import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/doctor")
public class DoctorController {
    private final DoctorService doctorService;
    @GetMapping
    public ResponseEntity<List<DoctorDto>> getAllDoctors(){
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }
    @GetMapping("/{id}")
    public ResponseEntity<DoctorDto> getDoctorById(@PathVariable Long id){
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }
    @PostMapping
    public ResponseEntity<DoctorDto> createDoctor(@RequestBody DoctorDto doctorDto){
        return new ResponseEntity<>(doctorService.createDoctor(doctorDto), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<DoctorDto> updateDoctor(@PathVariable Long id,@RequestBody DoctorDto doctorDto){
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctorDto));
    }
    @GetMapping("/name")
    public ResponseEntity<List<DoctorDto>> getDoctorByName(@RequestParam String name){
        return ResponseEntity.ok(doctorService.getDoctorByName(name));
    }
    @GetMapping("/nationalId")
    public ResponseEntity<DoctorDto> getDoctorByNationalId(@RequestParam String nationalId){
        return ResponseEntity.ok(doctorService.getDoctorByNationalId(nationalId));
    }
    @DeleteMapping("/{id}")
    public void deleteDoctor(@PathVariable Long id){
        doctorService.deleteDoctor(id);
    }
    @GetMapping("/employmentStatus")
    public ResponseEntity<List<DoctorDto>> getDoctorByEmploymentStatus(@RequestParam("employmentStatus") String status){
        return ResponseEntity.ok(doctorService.getDoctorByEmploymentStatus(status));
    }
    @GetMapping("/specialization")
    public ResponseEntity<List<DoctorDto>> getDoctorBySpecialization(@RequestParam String specialization){
        return ResponseEntity.ok(doctorService.getDoctorBySpecialization(specialization));
    }
    @GetMapping("/{id}/patients")
    public ResponseEntity<List<PatientDTO>> getDoctorPatients(@PathVariable Long id){
        return ResponseEntity.ok(doctorService.getDoctorPatients(id));
    }
}
