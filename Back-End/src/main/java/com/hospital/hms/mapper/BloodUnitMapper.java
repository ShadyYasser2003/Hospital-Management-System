package com.hospital.hms.mapper;

import com.hospital.hms.Enum.BloodType;
import com.hospital.hms.Enum.BloodUnitStatus;
import com.hospital.hms.dto.BloodUnitDto;
import com.hospital.hms.entity.BloodUnit;

import java.time.LocalDate;

/**
 * Static utility mapper — mirrors the pattern used by LabTestMapper and RadiologyOrderMapper.
 * Only maps basic scalar fields; the service layer handles relations and defaults.
 */
public class BloodUnitMapper {

    /** Entity → DTO */
    public static BloodUnitDto mapToDto(BloodUnit unit) {
        return BloodUnitDto.builder()
                .id(unit.getId())
                .bloodType(unit.getBloodType() != null ? unit.getBloodType().name() : null)
                .quantity(unit.getQuantity())
                .expiryDate(unit.getExpiryDate() != null ? unit.getExpiryDate().toString() : null)
                .status(unit.getStatus() != null ? unit.getStatus().name() : null)
                .notes(unit.getNotes())
                .build();
    }

    /** DTO → Entity (for create / update — service must set status/createdAt). */
    public static BloodUnit mapToEntity(BloodUnitDto dto) {
        return BloodUnit.builder()
                .id(dto.getId())
                .bloodType(parseBloodType(dto.getBloodType()))
                .quantity(dto.getQuantity())
                .expiryDate(dto.getExpiryDate() != null
                        ? LocalDate.parse(dto.getExpiryDate()) : null)
                .status(dto.getStatus() != null
                        ? BloodUnitStatus.valueOf(dto.getStatus().toUpperCase().trim())
                        : BloodUnitStatus.AVAILABLE)
                .notes(dto.getNotes())
                .build();
    }

    // ──────────────── helpers ────────────────

    public static BloodType parseBloodType(String value) {
        if (value == null || value.isBlank())
            throw new RuntimeException("Blood type is required");
        try {
            return BloodType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid blood type: " + value
                    + ". Valid values: A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, "
                    + "AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE");
        }
    }
}
