package com.hospital.hms.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private Double amount;
    private String paymentMethod;
    private String notes;
    private String referenceNumber;
    private LocalDateTime paidAt;

    private Long invoiceId;
    private String invoiceNumber;
    private Long patientId;
    private String patientName;
}
