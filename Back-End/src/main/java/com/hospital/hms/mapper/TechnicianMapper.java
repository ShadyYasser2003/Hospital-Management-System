package com.hospital.hms.mapper;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.TechnicianSpecialization;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.TechnicianDto;
import com.hospital.hms.entity.Technician;

public class TechnicianMapper {

    public static TechnicianDto mapToDto(Technician technician) {
        return TechnicianDto.builder()
                .id(technician.getId())
                .username(technician.getUsername())
                .name(technician.getName())
                .email(technician.getEmail())
                .phone(technician.getPhone())
                .nationalId(technician.getNationalId())
                .password(technician.getPassword())
                .address(technician.getAddress())
                .avatar(technician.getAvatar())
                .role(technician.getRole() != null ? technician.getRole().toString() : "TECHNICIAN")
                .status(technician.getUserStatus() != null ? technician.getUserStatus().toString() : "ACTIVE")
                .licenseNumber(technician.getLicenseNumber())
                .specialization(technician.getSpecialization() != null
                        ? technician.getSpecialization().toString() : null)
                .yearsOfExperience(technician.getYearsOfExperience())
                .hireDate(DateUtils.format(technician.getHireDate()))
                .employmentStatus(technician.getEmploymentStatus() != null
                        ? technician.getEmploymentStatus().toString() : null)
                .shift(technician.getShift())
                .certifications(technician.getCertifications())
                .departmentId(technician.getDepartment() != null
                        ? technician.getDepartment().getId() : null)
                .departmentName(technician.getDepartment() != null
                        ? technician.getDepartment().getName() : null)
                .build();
    }


    public static Technician mapToEntity(TechnicianDto dto) {
        Technician.TechnicianBuilder<?, ?> builder = Technician.builder()
                .id(dto.getId())
                .username(dto.getUsername())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .nationalId(dto.getNationalId())
                .password(dto.getPassword())
                .address(dto.getAddress())
                .avatar(dto.getAvatar())
                .licenseNumber(dto.getLicenseNumber())
                .yearsOfExperience(dto.getYearsOfExperience())
                .hireDate(DateUtils.parse(dto.getHireDate()))
                .shift(dto.getShift())
                .certifications(dto.getCertifications());

        builder.role(dto.getRole() != null && !dto.getRole().isBlank()
                ? UserRole.valueOf(dto.getRole().toUpperCase().trim())
                : UserRole.TECHNICIAN);

        builder.userStatus(dto.getStatus() != null && !dto.getStatus().isBlank()
                ? UserStatus.valueOf(dto.getStatus().toUpperCase().trim())
                : UserStatus.ACTIVE);

        builder.employmentStatus(dto.getEmploymentStatus() != null && !dto.getEmploymentStatus().isBlank()
                ? EmploymentStatus.valueOf(dto.getEmploymentStatus().toUpperCase().trim())
                : EmploymentStatus.FULL_TIME);

        builder.specialization(dto.getSpecialization() != null && !dto.getSpecialization().isBlank()
                ? TechnicianSpecialization.valueOf(dto.getSpecialization().toUpperCase().trim())
                : TechnicianSpecialization.GENERAL);

        return builder.build();
    }

}
