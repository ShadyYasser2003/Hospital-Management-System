package com.hospital.hms.mapper;

import com.hospital.hms.dto.MedicineCategoryDto;
import com.hospital.hms.entity.MedicineCategory;

public class MedicineCategoryMapper {
    public static MedicineCategoryDto mapToDto(MedicineCategory category){
        return MedicineCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
    public static MedicineCategory mapFromDto(MedicineCategoryDto category){
        return MedicineCategory.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}
