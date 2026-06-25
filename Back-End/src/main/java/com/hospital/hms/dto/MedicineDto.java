package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class MedicineDto {
    private Long id;
    private String name;
    private String genericName;
    private String status;
    private Boolean prescriptionRequired;
    private String description;
    private String sideEffects;
    private String createdAt;   // String — formatted in mapper
    private String updatedAt;   // String — formatted in mapper
}
