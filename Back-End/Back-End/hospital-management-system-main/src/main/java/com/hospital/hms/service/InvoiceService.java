package com.hospital.hms.service;

import com.hospital.hms.dto.InvoiceDTO;
import com.hospital.hms.dto.InvoiceItemDTO;
import com.hospital.hms.dto.PaymentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InvoiceService {

    /** Create a new invoice for a patient */
    InvoiceDTO createInvoice(Long patientId, Long accountantId, String notes);

    InvoiceDTO getById(Long id);

    InvoiceDTO getByInvoiceNumber(String invoiceNumber);

    Page<InvoiceDTO> getAllInvoices(Pageable pageable);

    List<InvoiceDTO> getByPatient(Long patientId);

    List<InvoiceDTO> getByStatus(String status);

    /** Add a line item to an existing invoice */
    InvoiceDTO addItem(Long invoiceId, InvoiceItemDTO itemDto);

    /** Remove a line item */
    InvoiceDTO removeItem(Long invoiceId, Long itemId);

    /**
     * Record a payment against an invoice.
     * Automatically updates invoice status (PARTIAL / PAID).
     * Sends payment notification to patient.
     */
    PaymentDTO recordPayment(Long invoiceId, PaymentDTO paymentDto);

    List<PaymentDTO> getPaymentsByInvoice(Long invoiceId);

    List<PaymentDTO> getPaymentsByPatient(Long patientId);

    List<PaymentDTO> getAllPayments();

    InvoiceDTO cancelInvoice(Long invoiceId);

    /**
     * Integration hook: called by PharmacistService after dispensation.
     * Adds a MEDICATION line item to the patient's open invoice (or creates one).
     */
    InvoiceDTO addMedicationCharge(Long patientId, Long prescriptionId,
                                   String description, Double amount);

    /**
     * Integration hook: called by TestRequestService after test completion.
     * Adds a LAB_TEST / IMAGING line item.
     */
    InvoiceDTO addTestCharge(Long patientId, Long testRequestId,
                             String testType, Double amount);
}
