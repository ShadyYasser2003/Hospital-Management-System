package com.hospital.hms.mapper;

import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.PharmacistDto;
import com.hospital.hms.entity.Pharmacist;

public class PharmacistMapper {

    public static PharmacistDto mapToDto(Pharmacist pharmacist) {
        return PharmacistDto.builder()
                .id(pharmacist.getId())
                .username(pharmacist.getUsername())
                .name(pharmacist.getName())
                .email(pharmacist.getEmail())
                .phone(pharmacist.getPhone())
                .role(pharmacist.getRole() != null ? pharmacist.getRole().toString() : "PHARMACIST")
                .nationalId(pharmacist.getNationalId())
                .password(pharmacist.getPassword())
                .address(pharmacist.getAddress())
                .avatar(pharmacist.getAvatar())
                .status(pharmacist.getUserStatus() != null ? pharmacist.getUserStatus().toString() : "ACTIVE")
                .shift(pharmacist.getShift())
                .licenseNumber(pharmacist.getLicenseNumber())
                .licenseExpiryDate(DateUtils.format(pharmacist.getLicenseExpiryDate()))
                .build();
    }

    public static Pharmacist mapFromDto(PharmacistDto pharmacistDto) {
        Pharmacist.PharmacistBuilder<?, ?> builder = Pharmacist.builder()
                .id(pharmacistDto.getId())
                .username(pharmacistDto.getUsername())
                .name(pharmacistDto.getName())
                .email(pharmacistDto.getEmail())
                .phone(pharmacistDto.getPhone())
                .nationalId(pharmacistDto.getNationalId())
                .password(pharmacistDto.getPassword())
                .address(pharmacistDto.getAddress())
                .avatar(pharmacistDto.getAvatar())
                .shift(pharmacistDto.getShift())
                .licenseNumber(pharmacistDto.getLicenseNumber())
                .licenseExpiryDate(DateUtils.parse(pharmacistDto.getLicenseExpiryDate()));

        builder.role(pharmacistDto.getRole() != null && !pharmacistDto.getRole().isBlank()
                ? UserRole.valueOf(pharmacistDto.getRole().toUpperCase().trim()) : UserRole.PHARMACIST);
        builder.userStatus(pharmacistDto.getStatus() != null && !pharmacistDto.getStatus().isBlank()
                ? UserStatus.valueOf(pharmacistDto.getStatus().toUpperCase().trim()) : UserStatus.ACTIVE);

        return builder.build();
    }
}
