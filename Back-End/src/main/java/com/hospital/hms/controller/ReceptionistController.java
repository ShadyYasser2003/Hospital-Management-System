package com.hospital.hms.controller;

import com.hospital.hms.dto.ReceptionistDto;
import com.hospital.hms.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {
    private final ReceptionistService receptionistService;

    @GetMapping
    public ResponseEntity<List<ReceptionistDto>> getAllReceptionists(){
        return ResponseEntity.ok(receptionistService.getAllReceptionist());
    }
    @GetMapping("/{id}")
    public ResponseEntity<ReceptionistDto> getReceptionistById(@PathVariable Long id){
        return ResponseEntity.ok(receptionistService.getReceptionistById(id));
    }
    @PostMapping
    public ResponseEntity<ReceptionistDto> createReceptionist(@RequestBody ReceptionistDto receptionistDto){
        return new ResponseEntity<>(receptionistService.createReceptionist(receptionistDto), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ReceptionistDto> updateReceptionist(@PathVariable Long id,@RequestBody ReceptionistDto receptionistDto){
        return ResponseEntity.ok(receptionistService.updateReceptionist(id, receptionistDto));
    }
    @GetMapping("/name")
    public ResponseEntity<List<ReceptionistDto>> getReceptionistByName(@RequestParam String name){
        return ResponseEntity.ok(receptionistService.getReceptionistByName(name));
    }
    @GetMapping("/nationalId")
    public ResponseEntity<ReceptionistDto> getReceptionistByNationalId(@RequestParam String nationalId){
        return ResponseEntity.ok(receptionistService.getReceptionistByNationalId(nationalId));
    }
    @DeleteMapping("/{id}")
    public void deleteReceptionist(@PathVariable Long id){
        receptionistService.deleteReceptionist(id);
    }
    @GetMapping("/employmentStatus")
    public ResponseEntity<List<ReceptionistDto>> getReceptionistByEmploymentStatus(@RequestParam("employmentStatus") String status){
        return ResponseEntity.ok(receptionistService.getReceptionistByEmploymentStatus(status));
    }
    /*@GetMapping("/specialityArea")
    public ResponseEntity<List<ReceptionistDto>> getReceptionistBySpecialityArea(@RequestParam String SpecialityArea){
        return ResponseEntity.ok(receptionistService.getReceptionistBySpecialityArea(SpecialityArea));
    }*/
}
