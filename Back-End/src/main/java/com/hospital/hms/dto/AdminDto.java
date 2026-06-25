package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class AdminDto extends UserDto{
    private List<Long> departmentIds;
    private List<Long> patientIds;
    private List<Long> doctorIds;
    private List<Long> nurseIds;
}
