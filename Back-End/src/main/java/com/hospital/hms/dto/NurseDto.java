package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class NurseDto extends UserDto {
    private String licenseNumber;
    private String specialization;
    private Integer yearsOfExperience;
    private String hireDate;   // String — parsed manually in service
    private String employmentStatus;
    private String shift;
}
