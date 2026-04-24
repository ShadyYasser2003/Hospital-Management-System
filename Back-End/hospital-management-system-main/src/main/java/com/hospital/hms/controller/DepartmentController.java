package com.hospital.hms.controller;

import com.hospital.hms.dto.DepartmentDto;
import com.hospital.hms.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<DepartmentDto> createDepartment(@RequestBody DepartmentDto departmentDto){
        return new ResponseEntity<>(departmentService.createDepartment(departmentDto), HttpStatus.CREATED) ;
    }
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable Long id){
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }
    @GetMapping
    public ResponseEntity<List<DepartmentDto>> getAllDepartments(){
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }
    @DeleteMapping("/{id}")
    public void deleteDepartment(@PathVariable Long id){
        departmentService.deleteDepartment(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDto> updateDepartment(@PathVariable Long id,@RequestBody DepartmentDto departmentDto){
        return ResponseEntity.ok(departmentService.updateDepartment(id, departmentDto));
    }
    @GetMapping("/search")
    public ResponseEntity<DepartmentDto> getDepartmentByName(@RequestParam String name){
        return ResponseEntity.ok(departmentService.getDepartmentByName(name));
    }
    @GetMapping("/active")
    public ResponseEntity<List<DepartmentDto>> getDepartmentStatus(@RequestParam boolean active){
        return ResponseEntity.ok(departmentService.getDepartmentByStatus(active));
    }
}
