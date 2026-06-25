package com.hospital.hms.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AccountantDto extends UserDto {
    private String employeeNumber;
    private String employmentStatus;
    private String shift;
    private String departmentName;
}
