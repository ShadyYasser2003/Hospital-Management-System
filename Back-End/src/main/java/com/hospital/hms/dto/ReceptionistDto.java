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
public class ReceptionistDto extends UserDto {
    private String shift;
    private String specialityArea;
    private String hipaaTrainingDate;          // String — parsed manually
    private String customerServiceTraining;    // String — parsed manually
    private String employmentStatus;
}
