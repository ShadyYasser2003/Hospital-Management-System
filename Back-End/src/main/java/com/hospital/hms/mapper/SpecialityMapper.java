package com.hospital.hms.mapper;

import com.hospital.hms.dto.SpecialityDto;
import com.hospital.hms.entity.Speciality;

public class SpecialityMapper {
    public static SpecialityDto mapToDto(Speciality speciality){
        return SpecialityDto.builder()
                .id(speciality.getId())
                .name(speciality.getName())
                .status(speciality.getStatus())
                .description(speciality.getDescription())
                .build();
    }
    public static Speciality mapFromDto(SpecialityDto speciality){
        return Speciality.builder()
                .id(speciality.getId())
                .name(speciality.getName())
                .status(speciality.getStatus())
                .description(speciality.getDescription())
                .build();
    }
}
