package com.hospital.hms.mapper;

import com.hospital.hms.dto.DepartmentDto;
import com.hospital.hms.entity.*;

public class DepartmentMapper {
    public static DepartmentDto mapToDepartmentDto(Department department) {
        return DepartmentDto.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .location(department.getLocation())
                .budget(department.getBudget())
                .isActive(department.isActive())
                .availableBeds(department.getAvailableBeds())
                .totalBeds(department.getTotalBeds())
                .build();
    }

    public static Department mapToDepartment(DepartmentDto departmentDto) {
        return Department.builder()
                .id(departmentDto.getId())
                .name(departmentDto.getName())
                .description(departmentDto.getDescription())
                .location(departmentDto.getLocation())
                .budget(departmentDto.getBudget())
                .isActive(departmentDto.isActive())
                .availableBeds(departmentDto.getAvailableBeds())
                .totalBeds(departmentDto.getTotalBeds())
                .build();


    }
}
