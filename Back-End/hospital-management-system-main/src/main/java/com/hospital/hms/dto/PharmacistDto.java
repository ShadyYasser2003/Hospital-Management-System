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
public class PharmacistDto extends UserDto {
    private String licenseNumber;
    private String licenseExpiryDate;  // String — parsed manually in service
    private String shift;
}
