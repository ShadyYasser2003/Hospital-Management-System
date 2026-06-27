package com.hospital.hms.service;

import com.hospital.hms.dto.InvoiceDTO;
import com.hospital.hms.dto.InvoiceItemDTO;
import com.hospital.hms.dto.PaymentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InvoiceService {
    InvoiceDTO createInvoice(Long patientId, Long accountantId, String notes);
    InvoiceDTO getById(Long id);
    InvoiceDTO getByInvoiceNumber(String invoiceNumber);
    Page<InvoiceDTO> getAllInvoices(Pageable pageable);
    List<InvoiceDTO> getByPatient(Long patientId);
    List<InvoiceDTO> getByStatus(String status);
    InvoiceDTO addItem(Long invoiceId, InvoiceItemDTO itemDto);
    InvoiceDTO removeItem(Long invoiceId, Long itemId);
    PaymentDTO recordPayment(Long invoiceId, PaymentDTO paymentDto);
    List<PaymentDTO> getPaymentsByInvoice(Long invoiceId);
    List<PaymentDTO> getPaymentsByPatient(Long patientId);
    List<PaymentDTO> getAllPayments();
    InvoiceDTO cancelInvoice(Long invoiceId);
    InvoiceDTO addMedicationCharge(Long patientId, Long prescriptionId,
                                   String description, Double amount);
    InvoiceDTO addTestCharge(Long patientId, Long testRequestId,
                             String testType, Double amount);
    InvoiceDTO addBedCharge(Long patientId, int days, Double chargePerDay,
                            String admissionDate, String dischargeDate);
    InvoiceDTO addConsultationCharge(Long patientId, Long appointmentId,
                                     String description, Double amount);

    /**
     * Throws RuntimeException if the patient has no open (PENDING/PARTIAL) invoice.
     * Call this at the start of any operation that requires a pre-existing invoice.
     */
    void requireOpenInvoice(Long patientId);
}
