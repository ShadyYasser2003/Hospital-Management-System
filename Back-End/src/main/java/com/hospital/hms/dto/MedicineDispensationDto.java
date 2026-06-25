package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDispensationDto {
    private Long id;
    private int dispensedQuantity;
    private String dispensedDate;   // String — formatted in mapper
    private String status;
    private Double charges;
}
