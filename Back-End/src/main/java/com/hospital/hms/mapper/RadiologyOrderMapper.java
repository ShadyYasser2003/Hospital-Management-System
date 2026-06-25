package com.hospital.hms.mapper;

import com.hospital.hms.Enum.RadiologyOrderStatus;
import com.hospital.hms.Enum.RadiologyOrderType;
import com.hospital.hms.dto.RadiologyOrderDto;
import com.hospital.hms.entity.RadiologyOrder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class RadiologyOrderMapper {
    private static final DateTimeFormatter DT_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public static RadiologyOrderDto mapToDto(RadiologyOrder order) {
        return RadiologyOrderDto.builder()
                .id(order.getId())
                // Patient
                .patientId(order.getPatient() != null ? order.getPatient().getId() : null)
                .patientName(order.getPatientName())
                // Doctor
                .doctorId(order.getDoctor() != null ? order.getDoctor().getId() : null)
                .doctorName(order.getDoctorName())
                // Technician
                .technicianId(order.getTechnician() != null ? order.getTechnician().getId() : null)
                .technicianName(order.getTechnicianName())
                // Order info
                .orderType(order.getOrderType() != null ? order.getOrderType().toString() : null)
                .bodyPart(order.getBodyPart())
                .clinicalIndication(order.getClinicalIndication())
                .contrast(order.getContrast())
                .specialInstructions(order.getSpecialInstructions())
                // Status & dates
                .status(order.getStatus() != null ? order.getStatus().toString() : null)
                .orderedAt(format(order.getOrderedAt()))
                .scheduledAt(format(order.getScheduledAt()))
                .completedAt(format(order.getCompletedAt()))
                // Results
                .reportFindings(order.getReportFindings())
                .impression(order.getImpression())
                .imageUrl(order.getImageUrl())
                .isCritical(order.getIsCritical())
                .notes(order.getNotes())
                .build();
    }




    public static RadiologyOrder mapToEntity(RadiologyOrderDto dto) {
        return RadiologyOrder.builder()
                .id(dto.getId())
                .patientName(dto.getPatientName())
                .doctorName(dto.getDoctorName())
                .technicianName(dto.getTechnicianName())
                .orderType(parseOrderType(dto.getOrderType()))
                .bodyPart(dto.getBodyPart())
                .clinicalIndication(dto.getClinicalIndication())
                .contrast(dto.getContrast())
                .specialInstructions(dto.getSpecialInstructions())
                .status(parseStatus(dto.getStatus()))
                .orderedAt(parse(dto.getOrderedAt()))
                .scheduledAt(parse(dto.getScheduledAt()))
                .completedAt(parse(dto.getCompletedAt()))
                .reportFindings(dto.getReportFindings())
                .impression(dto.getImpression())
                .imageUrl(dto.getImageUrl())
                .isCritical(dto.getIsCritical() != null ? dto.getIsCritical() : false)
                .notes(dto.getNotes())
                .build();
    }











    private static String format(LocalDateTime dt) {
        return dt != null ? dt.format(DT_FORMAT) : null;
    }

    private static LocalDateTime parse(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDateTime.parse(value.trim(), DT_FORMAT);
        } catch (DateTimeParseException e1) {
            try {
                return LocalDateTime.parse(value.trim() + " 00:00", DT_FORMAT);
            } catch (DateTimeParseException e2) {
                throw new RuntimeException("Cannot parse datetime: '" + value
                        + "'. Use yyyy-MM-dd HH:mm or yyyy-MM-dd");
            }
        }
    }

    private static RadiologyOrderType parseOrderType(String value) {
        if (value == null || value.isBlank()) return RadiologyOrderType.OTHER;
        try {
            return RadiologyOrderType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid radiology order type: " + value);
        }
    }

    private static RadiologyOrderStatus parseStatus(String value) {
        if (value == null || value.isBlank()) return RadiologyOrderStatus.ORDERED;
        try {
            return RadiologyOrderStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid radiology order status: " + value);
        }
    }
}
