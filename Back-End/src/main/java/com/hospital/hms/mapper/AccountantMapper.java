package com.hospital.hms.mapper;

import com.hospital.hms.dto.AccountantDto;
import com.hospital.hms.entity.Accountant;

public class AccountantMapper {

    public static AccountantDto mapToDto(Accountant a) {
        return AccountantDto.builder()
                .id(a.getId())
                .username(a.getUsername())
                .name(a.getName())
                .email(a.getEmail())
                .phone(a.getPhone())
                .nationalId(a.getNationalId())
                .address(a.getAddress())
                .avatar(a.getAvatar())
                .role(a.getRole() != null ? a.getRole().toString() : "ACCOUNTANT")
                .status(a.getUserStatus() != null ? a.getUserStatus().toString() : "ACTIVE")
                .dateOfBirth(a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null)
                .employeeNumber(a.getEmployeeNumber())
                .employmentStatus(a.getEmploymentStatus() != null ? a.getEmploymentStatus().toString() : null)
                .shift(a.getShift())
                .departmentName(a.getDepartment() != null ? a.getDepartment().getName() : null)
                .build();
    }
}
