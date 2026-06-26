package com.hospital.hms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemDTO {
    private Long id;
    private String description;
    private String itemType;
    private Integer quantity;
    private Double unitPrice;
    private Double total;
    private Long referenceId;
}
