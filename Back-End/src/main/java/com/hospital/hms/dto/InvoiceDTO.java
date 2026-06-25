package com.hospital.hms.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private String status;
    private Double totalAmount;
    private Double paidAmount;
    private Double balance;
    private String notes;
    private LocalDateTime createdAt;

    private Long patientId;
    private String patientName;
    private Long accountantId;

    private List<InvoiceItemDTO> items;
}
