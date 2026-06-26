package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

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

    /**
     * Using Boolean (boxed) with field name "active" — no "is" prefix.
     * Jackson serialises this cleanly as "active" without any prefix-stripping.
     * Null means "not sent" so update logic can tell the difference.
     */
    private Boolean active;

    private int totalBeds;
    private int availableBeds;
}
