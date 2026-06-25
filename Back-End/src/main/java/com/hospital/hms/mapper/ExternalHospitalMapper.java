package com.hospital.hms.mapper;

import com.hospital.hms.dto.ExternalHospitalDto;
import com.hospital.hms.entity.ExternalHospital;

public class ExternalHospitalMapper {

    public static ExternalHospitalDto mapToDto(ExternalHospital hospital) {
        return ExternalHospitalDto.builder()
                .id(hospital.getId())
                .name(hospital.getName())
                .email(hospital.getEmail())
                .phone(hospital.getPhone())
                .address(hospital.getAddress())
                .isActive(hospital.getIsActive())
                .build();
    }

    public static ExternalHospital mapToEntity(ExternalHospitalDto dto) {
        return ExternalHospital.builder()
                .id(dto.getId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
    }
}