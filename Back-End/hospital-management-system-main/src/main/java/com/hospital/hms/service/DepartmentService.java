package com.hospital.hms.service;

import com.hospital.hms.dto.DepartmentDto;
import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.dto.NurseDto;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.entity.Department;

import java.util.List;

public interface DepartmentService {
    DepartmentDto createDepartment(DepartmentDto departmentDto);
    void deleteDepartment(Long id);
    DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto);
    DepartmentDto getDepartmentById(Long id);
    List<DepartmentDto> getAllDepartments();
    DepartmentDto getDepartmentByName(String name);
    List<DepartmentDto> getDepartmentByStatus(boolean active);

}
