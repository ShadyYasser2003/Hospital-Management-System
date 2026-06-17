package com.hospital.hms.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TechnicianDto extends UserDto {
    private String licenseNumber;
    private String specialization;
    private Integer yearsOfExperience;
    private String hireDate;
    private String employmentStatus;
    private String shift;
    private String departmentName;
}
