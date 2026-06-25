package com.hospital.hms.mapper;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.ReceptionistDto;
import com.hospital.hms.entity.Receptionist;

public class ReceptionistMapper {

    public static ReceptionistDto mapToDto(Receptionist receptionist) {
        return ReceptionistDto.builder()
                .id(receptionist.getId())
                .username(receptionist.getUsername())
                .name(receptionist.getName())
                .email(receptionist.getEmail())
                .phone(receptionist.getPhone())
                .role(receptionist.getRole() != null ? receptionist.getRole().toString() : "RECEPTIONIST")
                .nationalId(receptionist.getNationalId())
                .password(receptionist.getPassword())
                .address(receptionist.getAddress())
                .avatar(receptionist.getAvatar())
                .status(receptionist.getUserStatus() != null ? receptionist.getUserStatus().toString() : "ACTIVE")
                .shift(receptionist.getShift())
                .specialityArea(receptionist.getSpecialityArea())
                .customerServiceTraining(DateUtils.format(receptionist.getCustomerServiceTraining()))
                .hipaaTrainingDate(DateUtils.format(receptionist.getHipaaTrainingDate()))
                .employmentStatus(receptionist.getEmploymentStatus() != null ? receptionist.getEmploymentStatus().toString() : null)
                .build();
    }

    public static Receptionist mapFromDto(ReceptionistDto receptionistDto) {
        Receptionist.ReceptionistBuilder<?, ?> builder = Receptionist.builder()
                .id(receptionistDto.getId())
                .username(receptionistDto.getUsername())
                .name(receptionistDto.getName())
                .email(receptionistDto.getEmail())
                .phone(receptionistDto.getPhone())
                .nationalId(receptionistDto.getNationalId())
                .password(receptionistDto.getPassword())
                .address(receptionistDto.getAddress())
                .avatar(receptionistDto.getAvatar())
                .shift(receptionistDto.getShift())
                .specialityArea(receptionistDto.getSpecialityArea())
                .customerServiceTraining(DateUtils.parse(receptionistDto.getCustomerServiceTraining()))
                .hipaaTrainingDate(DateUtils.parse(receptionistDto.getHipaaTrainingDate()));

        builder.role(receptionistDto.getRole() != null && !receptionistDto.getRole().isBlank()
                ? UserRole.valueOf(receptionistDto.getRole().toUpperCase().trim()) : UserRole.RECEPTIONIST);
        builder.userStatus(receptionistDto.getStatus() != null && !receptionistDto.getStatus().isBlank()
                ? UserStatus.valueOf(receptionistDto.getStatus().toUpperCase().trim()) : UserStatus.ACTIVE);
        builder.employmentStatus(receptionistDto.getEmploymentStatus() != null && !receptionistDto.getEmploymentStatus().isBlank()
                ? EmploymentStatus.valueOf(receptionistDto.getEmploymentStatus().toUpperCase().trim()) : EmploymentStatus.FULL_TIME);

        return builder.build();
    }
}
