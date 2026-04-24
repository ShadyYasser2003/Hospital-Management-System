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
public class DoctorDto extends UserDto {
    private String licenseNumber;
    private String specialization;
    private String qualification;
    private String medicalSchool;
    private Integer yearOfGraduation;
    private Integer yearsOfExperience;
    private String hireDate;   // String — parsed manually in service
    private String employmentStatus;
    private String shift;
}
