package com.hospital.hms.controller;

import com.hospital.hms.dto.*;
import com.hospital.hms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PutMapping("/nurse/{nurseId}/assign-department/{departmentId}")
    public ResponseEntity<NurseDto> assignNurseToDepartment(@PathVariable Long nurseId,@PathVariable Long departmentId){
        return ResponseEntity.ok(adminService.assignNurseToDep(nurseId, departmentId));
    }
    @PutMapping("/pharmacist/{pharmacistId}/assign-department/{departmentId}")
    public ResponseEntity<PharmacistDto> assignPharmacistToDepartment(@PathVariable Long pharmacistId, @PathVariable Long departmentId){
        return ResponseEntity.ok(adminService.assignPharmacistToDep(pharmacistId,departmentId));
    }
    @PutMapping("/doctor/{doctorId}/assign-department/{departmentId}")
    public ResponseEntity<DoctorDto> assignDoctorToDepartment(@PathVariable Long doctorId, @PathVariable Long departmentId){
        return ResponseEntity.ok(adminService.assignDoctorToDep(doctorId, departmentId));
    }
    @GetMapping("/departments/{departmentId}/staff")
    public ResponseEntity<List<UserDto>> getAllStaffInDepartment(@PathVariable Long departmentId){
        return ResponseEntity.ok(adminService.getAllStaffInDep(departmentId));
    }
    @PutMapping("/patients/{patientId}/add/{departmentId}")
    public ResponseEntity<PatientDTO> addPatientToNewDepartment(@PathVariable Long patientId,@PathVariable Long departmentId){

        return ResponseEntity.ok(adminService.addPatientToNewDepartment(patientId, departmentId));
    }
    @PutMapping("/patients/{patientId}/transfer/{newDep}/to/{oldDep}")
    public ResponseEntity<PatientDTO> transferPatientBetweenDepartment(@PathVariable("newDep") Long newDep,@PathVariable("oldDep") Long oldDep,@PathVariable("patientId") Long patientId){
        return ResponseEntity.ok(adminService.transferPatientBetweenDepartments(newDep, oldDep, patientId));
    }
    @PutMapping("/patients/{patientId}/assign-doctor/{doctorId}")
    public ResponseEntity<PatientDTO> assignPatientToDoctor(@PathVariable Long patientId,@PathVariable Long doctorId){
        return ResponseEntity.ok(adminService.assignPatientToDoctor(doctorId, patientId));
    }
    @GetMapping("/department/{departmentId}/patients")
    public ResponseEntity<List<PatientDTO>> getPatientByDepartment(@PathVariable Long departmentId){
        return ResponseEntity.ok(adminService.getPatientByDepartment(departmentId));
    }
    @GetMapping("/patients/status/{patientStatus}")
    public ResponseEntity<List<PatientDTO>> getPatientByStatus(@PathVariable String patientStatus){
        return ResponseEntity.ok(adminService.getPatientByStatus(patientStatus));
    }

}
