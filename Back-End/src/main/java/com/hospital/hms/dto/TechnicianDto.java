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
public class TechnicianDto extends UserDto  {

    private String licenseNumber;

    private String specialization;

    private Integer yearsOfExperience;

    private String hireDate;

    private String employmentStatus;

    private String shift;

    private String certifications;

    private Long departmentId;
    private String departmentName;
}
