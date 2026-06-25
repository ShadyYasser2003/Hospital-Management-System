package com.hospital.hms.mapper;

import com.hospital.hms.dto.InvoiceDTO;
import com.hospital.hms.dto.InvoiceItemDTO;
import com.hospital.hms.entity.Invoice;
import com.hospital.hms.entity.InvoiceItem;

import java.util.List;
import java.util.stream.Collectors;

public class InvoiceMapper {

    public static InvoiceDTO mapToDto(Invoice inv) {
        List<InvoiceItemDTO> itemDtos = inv.getItems() == null ? List.of() :
                inv.getItems().stream().map(InvoiceMapper::mapItemToDto).collect(Collectors.toList());

        return InvoiceDTO.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .status(inv.getStatus() != null ? inv.getStatus().toString() : null)
                .totalAmount(inv.getTotalAmount())
                .paidAmount(inv.getPaidAmount())
                .balance(inv.getTotalAmount() - inv.getPaidAmount())
                .notes(inv.getNotes())
                .createdAt(inv.getCreatedAt())
                .patientId(inv.getPatient() != null ? inv.getPatient().getId() : null)
                .patientName(inv.getPatient() != null ? inv.getPatient().getName() : null)
                .accountantId(inv.getAccountant() != null ? inv.getAccountant().getId() : null)
                .items(itemDtos)
                .build();
    }

    public static InvoiceItemDTO mapItemToDto(InvoiceItem item) {
        return InvoiceItemDTO.builder()
                .id(item.getId())
                .description(item.getDescription())
                .itemType(item.getItemType() != null ? item.getItemType().toString() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .total(item.getTotal())
                .referenceId(item.getReferenceId())
                .build();
    }
}
