package com.hospital.hms.mapper;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.entity.Doctor;

public class DoctorMapper {

    public static DoctorDto mapToDoctorDto(Doctor doctor) {
        return DoctorDto.builder()
                .id(doctor.getId())
                .username(doctor.getUsername())
                .name(doctor.getName())
                .email(doctor.getEmail())
                .phone(doctor.getPhone())
                .role(doctor.getRole() != null ? doctor.getRole().toString() : "DOCTOR")
                .nationalId(doctor.getNationalId())
                // Never expose hashed password
                .address(doctor.getAddress())
                .avatar(doctor.getAvatar())
                .status(doctor.getUserStatus() != null ? doctor.getUserStatus().toString() : "ACTIVE")
                .licenseNumber(doctor.getLicenseNumber())
                .specialization(doctor.getSpecialization())
                .qualification(doctor.getQualification())
                .medicalSchool(doctor.getMedicalSchool())
                .yearOfGraduation(doctor.getYearOfGraduation())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .hireDate(DateUtils.format(doctor.getHireDate()))
                .employmentStatus(doctor.getEmploymentStatus() != null ? doctor.getEmploymentStatus().toString() : null)
                .shift(doctor.getShift())
                .departmentName(doctor.getDepartment() != null ? doctor.getDepartment().getName() : null)
                .build();
    }

    public static Doctor mapToDoctor(DoctorDto doctorDto) {
        Doctor.DoctorBuilder<?, ?> builder = Doctor.builder()
                .id(doctorDto.getId())
                .username(doctorDto.getUsername())
                .name(doctorDto.getName())
                .email(doctorDto.getEmail())
                .phone(doctorDto.getPhone())
                .nationalId(doctorDto.getNationalId())
                .password(doctorDto.getPassword())
                .address(doctorDto.getAddress())
                .avatar(doctorDto.getAvatar())
                .licenseNumber(doctorDto.getLicenseNumber())
                .specialization(doctorDto.getSpecialization())
                .qualification(doctorDto.getQualification())
                .medicalSchool(doctorDto.getMedicalSchool())
                .yearOfGraduation(doctorDto.getYearOfGraduation())
                .yearsOfExperience(doctorDto.getYearsOfExperience())
                .hireDate(DateUtils.parse(doctorDto.getHireDate()))
                .shift(doctorDto.getShift());

        builder.role(doctorDto.getRole() != null && !doctorDto.getRole().isBlank()
                ? UserRole.valueOf(doctorDto.getRole().toUpperCase().trim()) : UserRole.DOCTOR);
        builder.userStatus(doctorDto.getStatus() != null && !doctorDto.getStatus().isBlank()
                ? UserStatus.valueOf(doctorDto.getStatus().toUpperCase().trim()) : UserStatus.ACTIVE);
        builder.employmentStatus(doctorDto.getEmploymentStatus() != null && !doctorDto.getEmploymentStatus().isBlank()
                ? EmploymentStatus.valueOf(doctorDto.getEmploymentStatus().toUpperCase().trim()) : EmploymentStatus.FULL_TIME);

        return builder.build();
    }
}
