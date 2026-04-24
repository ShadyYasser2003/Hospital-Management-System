package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class DepartmentDto {
    private Long id;
    private String name;
    private String description;
    private String location;
    private String budget;
    private boolean isActive;
    private int totalBeds;
    private int availableBeds;


}
