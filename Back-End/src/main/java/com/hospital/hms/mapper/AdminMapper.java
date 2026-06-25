package com.hospital.hms.mapper;

import com.hospital.hms.dto.AdminDto;
import com.hospital.hms.entity.*;

import static java.util.stream.Collectors.toList;

public class AdminMapper {
    public static AdminDto mapToAdminDto(Admin admin){
        return AdminDto.builder()
                .departmentIds(admin.getDepartments().stream().map(Department::getId).toList())
                .nurseIds(admin.getNurses().stream().map(Nurse::getId).toList())
                .doctorIds(admin.getDoctors().stream().map(Doctor::getId).toList())
                .patientIds(admin.getPatients().stream().map(Patient::getId).toList())
                .id(admin.getId())
                .username(admin.getUsername())
                .name(admin.getName())
                .email(admin.getEmail())
                .nationalId(admin.getNationalId())
                .password(admin.getPassword())
                .address(admin.getAddress())
                .phone(admin.getPhone())
                .role(admin.getRole().toString())
                .avatar(admin.getAvatar())
                .status(admin.getUserStatus().toString())
                .build();
    }
    /*public static Admin mapToAdmin(AdminDto admin){
        return Admin.builder()
                .departments(admin.getDepartmentIds().stream().map())
                .nurseIds(admin.getNurses().stream().map(Nurse::getId).toList())
                .doctorIds(admin.getDoctors().stream().map(Doctor::getId).toList())
                .patientIds(admin.getPatients().stream().map(Patient::getId).toList())
                .id(admin.getId())
                .username(admin.getUsername())
                .name(admin.getName())
                .email(admin.getEmail())
                .nationalId(admin.getNationalId())
                .password(admin.getPassword())
                .address(admin.getAddress())
                .phone(admin.getPhone())
                .role(admin.getRole().toString())
                .avatar(admin.getAvatar())
                .status(admin.getUserStatus().toString())
                .build();
    }*/
}
