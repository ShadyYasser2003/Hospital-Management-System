package com.hospital.hms.mapper;

import com.hospital.hms.dto.PaymentDTO;
import com.hospital.hms.entity.Payment;

public class PaymentMapper {

    public static PaymentDTO mapToDto(Payment p) {
        return PaymentDTO.builder()
                .id(p.getId())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().toString() : null)
                .notes(p.getNotes())
                .referenceNumber(p.getReferenceNumber())
                .paidAt(p.getPaidAt())
                .invoiceId(p.getInvoice() != null ? p.getInvoice().getId() : null)
                .invoiceNumber(p.getInvoice() != null ? p.getInvoice().getInvoiceNumber() : null)
                .patientId(p.getPatient() != null ? p.getPatient().getId() : null)
                .patientName(p.getPatient() != null ? p.getPatient().getName() : null)
                .build();
    }
}
