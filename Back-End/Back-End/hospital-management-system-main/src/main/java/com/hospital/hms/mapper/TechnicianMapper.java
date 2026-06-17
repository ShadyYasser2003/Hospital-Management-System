package com.hospital.hms.mapper;

import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.TechnicianDto;
import com.hospital.hms.entity.Technician;

public class TechnicianMapper {

    public static TechnicianDto mapToDto(Technician t) {
        return TechnicianDto.builder()
                .id(t.getId())
                .username(t.getUsername())
                .name(t.getName())
                .email(t.getEmail())
                .phone(t.getPhone())
                .nationalId(t.getNationalId())
                .address(t.getAddress())
                .avatar(t.getAvatar())
                .role(t.getRole() != null ? t.getRole().toString() : "TECHNICIAN")
                .status(t.getUserStatus() != null ? t.getUserStatus().toString() : "ACTIVE")
                .dateOfBirth(t.getDateOfBirth() != null ? t.getDateOfBirth().toString() : null)
                .licenseNumber(t.getLicenseNumber())
                .specialization(t.getSpecialization())
                .yearsOfExperience(t.getYearsOfExperience())
                .hireDate(DateUtils.format(t.getHireDate()))
                .employmentStatus(t.getEmploymentStatus() != null ? t.getEmploymentStatus().toString() : null)
                .shift(t.getShift())
                .departmentName(t.getDepartment() != null ? t.getDepartment().getName() : null)
                .build();
    }
}
