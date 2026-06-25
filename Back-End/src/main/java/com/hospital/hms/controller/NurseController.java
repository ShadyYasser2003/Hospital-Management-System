package com.hospital.hms.controller;

import com.hospital.hms.dto.NurseDto;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nurse")
@RequiredArgsConstructor
public class NurseController {
    private final NurseService nurseService;

    @GetMapping
    public ResponseEntity<List<NurseDto>> getAllNurses(){
        return ResponseEntity.ok(nurseService.getAllNurses());
    }
    @GetMapping("/{id}")
    public ResponseEntity<NurseDto> getNurseById(@PathVariable Long id){
        return ResponseEntity.ok(nurseService.getNurseById(id));
    }
    @PostMapping
    public ResponseEntity<NurseDto> createNurse(@RequestBody NurseDto nurseDto){
        return new ResponseEntity<>(nurseService.createNurse(nurseDto), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<NurseDto> updateNurse(@PathVariable Long id,@RequestBody NurseDto nurseDto){
        return ResponseEntity.ok(nurseService.updateNurse(id, nurseDto));
    }
    @GetMapping("/name")
    public ResponseEntity<List<NurseDto>> getNurseByName(@RequestParam String name){
        return ResponseEntity.ok(nurseService.getNurseByName(name));
    }
    @GetMapping("/nationalId")
    public ResponseEntity<NurseDto> getNurseByNationalId(@RequestParam String nationalId){
        return ResponseEntity.ok(nurseService.getNurseByNationalId(nationalId));
    }
    @DeleteMapping("/{id}")
    public void deleteNurse(@PathVariable Long id){
        nurseService.deleteNurse(id);
    }
    @GetMapping("/employmentStatus")
    public ResponseEntity<List<NurseDto>> getNurseByEmploymentStatus(@RequestParam("employmentStatus") String status){
        return ResponseEntity.ok(nurseService.getNurseByEmploymentStatus(status));
    }
    @GetMapping("/specialization")
    public ResponseEntity<List<NurseDto>> getNurseBySpecialization(@RequestParam String specialization){
        return ResponseEntity.ok(nurseService.getNurseBySpecialization(specialization));
    }
    @GetMapping("/{id}/patients")
    public ResponseEntity<List<PatientDTO>> getDoctorPatients(@PathVariable Long id){
        return ResponseEntity.ok(nurseService.getNursePatients(id));
    }
}
