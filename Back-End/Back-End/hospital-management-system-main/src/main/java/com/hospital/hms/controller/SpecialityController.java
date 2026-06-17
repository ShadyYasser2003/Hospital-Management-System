package com.hospital.hms.controller;

import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.dto.NurseDto;
import com.hospital.hms.dto.SpecialityDto;
import com.hospital.hms.dto.UserDto;
import com.hospital.hms.service.DoctorService;
import com.hospital.hms.service.SpecialityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialities")
@RequiredArgsConstructor
public class SpecialityController {
    private final SpecialityService specialityService;
    @GetMapping
    public ResponseEntity<List<SpecialityDto>> getAllSpeciality(){
        return ResponseEntity.ok(specialityService.getAllSpecialities());
    }
    @GetMapping("/staff/{specialityName}")
    public ResponseEntity<List<UserDto>> getSpecialityStaff(@PathVariable String specialityName){
        return ResponseEntity.ok(specialityService.getSpecialityStaff(specialityName));
    }
    @GetMapping("/{id}")
    public ResponseEntity<SpecialityDto> getSpecialityById(@PathVariable Long id){
        return ResponseEntity.ok(specialityService.getSpecialityById(id));
    }
    @GetMapping("/name/{name}")
    public ResponseEntity<SpecialityDto> getSpecialityByName(@PathVariable String name){
        return ResponseEntity.ok(specialityService.getSpecialityByName(name));
    }
    @PostMapping
    public ResponseEntity<SpecialityDto> createSpeciality(@RequestBody SpecialityDto specialityDto){
        return new ResponseEntity<>(specialityService.createSpeciality(specialityDto), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<SpecialityDto> updateSpeciality(@PathVariable Long id,@RequestBody SpecialityDto specialityDto){
        return ResponseEntity.ok(specialityService.updateSpeciality(id,specialityDto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSpeciality(@PathVariable Long id){
        specialityService.deleteSpeciality(id);
        return ResponseEntity.ok("Speciality deleted successfully");
    }
    @PutMapping("/transfer/{doctorId}/doctor/{specialityId}/speciality")
    public ResponseEntity<DoctorDto> transferDoctorBetweenSpecialities(@PathVariable Long doctorId,@PathVariable Long specialityId){
        return ResponseEntity.ok(specialityService.addDoctorToSpecialty(doctorId, specialityId));
    }
    @PutMapping("/transfer/{nurseId}/nurse/{specialityId}/speciality")
    public ResponseEntity<NurseDto> transferNurseBetweenSpecialities(@PathVariable Long nurseId, @PathVariable Long specialityId){
        return ResponseEntity.ok(specialityService.addNurseToSpecialty(nurseId, specialityId));
    }
}
