package com.hospital.hms.mapper;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.NurseDto;
import com.hospital.hms.entity.Nurse;

public class NurseMapper {

    public static NurseDto mapToNurseDto(Nurse nurse) {
        return NurseDto.builder()
                .id(nurse.getId())
                .username(nurse.getUsername())
                .name(nurse.getName())
                .email(nurse.getEmail())
                .phone(nurse.getPhone())
                .role(nurse.getRole() != null ? nurse.getRole().toString() : "NURSE")
                .nationalId(nurse.getNationalId())
                // Never expose hashed password
                .address(nurse.getAddress())
                .avatar(nurse.getAvatar())
                .status(nurse.getUserStatus() != null ? nurse.getUserStatus().toString() : "ACTIVE")
                .licenseNumber(nurse.getLicenseNumber())
                .yearsOfExperience(nurse.getYearsOfExperience())
                .hireDate(DateUtils.format(nurse.getHireDate()))
                .employmentStatus(nurse.getEmploymentStatus() != null ? nurse.getEmploymentStatus().toString() : null)
                .shift(nurse.getShift())
                .specialization(nurse.getSpecialization())
                .build();
    }

    public static Nurse mapToNurse(NurseDto nurseDto) {
        Nurse.NurseBuilder<?, ?> builder = Nurse.builder()
                .id(nurseDto.getId())
                .username(nurseDto.getUsername())
                .name(nurseDto.getName())
                .email(nurseDto.getEmail())
                .phone(nurseDto.getPhone())
                .nationalId(nurseDto.getNationalId())
                .password(nurseDto.getPassword())
                .address(nurseDto.getAddress())
                .avatar(nurseDto.getAvatar())
                .licenseNumber(nurseDto.getLicenseNumber())
                .yearsOfExperience(nurseDto.getYearsOfExperience())
                .hireDate(DateUtils.parse(nurseDto.getHireDate()))
                .shift(nurseDto.getShift())
                .specialization(nurseDto.getSpecialization());

        builder.role(nurseDto.getRole() != null && !nurseDto.getRole().isBlank()
                ? UserRole.valueOf(nurseDto.getRole().toUpperCase().trim()) : UserRole.NURSE);
        builder.userStatus(nurseDto.getStatus() != null && !nurseDto.getStatus().isBlank()
                ? UserStatus.valueOf(nurseDto.getStatus().toUpperCase().trim()) : UserStatus.ACTIVE);
        builder.employmentStatus(nurseDto.getEmploymentStatus() != null && !nurseDto.getEmploymentStatus().isBlank()
                ? EmploymentStatus.valueOf(nurseDto.getEmploymentStatus().toUpperCase().trim()) : EmploymentStatus.FULL_TIME);

        return builder.build();
    }
}
