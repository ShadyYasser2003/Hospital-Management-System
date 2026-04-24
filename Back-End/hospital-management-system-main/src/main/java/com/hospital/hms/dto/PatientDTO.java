package com.hospital.hms.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class PatientDTO extends UserDto {
    // String instead of LocalDate — parsed manually in service
    private String dateOfBirth;
    private String gender;
    private String bloodType;
    private String emergencyContact;
    private String insuranceProvider;
    private String insuranceNumber;
    private String allergies;
    private String medicalHistory;
    private String diagnosis;
    private String notes;
    private String status;

    private String bloodPressure;
    private String temperature;
    private String pulse;
    private String weight;
    private String height;
}
