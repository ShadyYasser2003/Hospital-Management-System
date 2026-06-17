package com.hospital.hms.controller;

import com.hospital.hms.dto.InvoiceDTO;
import com.hospital.hms.dto.InvoiceItemDTO;
import com.hospital.hms.dto.PaymentDTO;
import com.hospital.hms.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /** Accountant creates an invoice for a patient */
    @PostMapping
    public ResponseEntity<InvoiceDTO> create(@RequestBody Map<String, Object> body) {
        Long patientId    = Long.parseLong(body.get("patientId").toString());
        Long accountantId = body.get("accountantId") != null
                ? Long.parseLong(body.get("accountantId").toString()) : null;
        String notes = (String) body.get("notes");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.createInvoice(patientId, accountantId, notes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<InvoiceDTO> getByNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(invoiceService.getByInvoiceNumber(invoiceNumber));
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(invoiceService.getAllInvoices(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<InvoiceDTO>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceService.getByPatient(patientId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(invoiceService.getByStatus(status));
    }

    /** Add a line item to an invoice */
    @PostMapping("/{id}/items")
    public ResponseEntity<InvoiceDTO> addItem(
            @PathVariable Long id, @RequestBody InvoiceItemDTO itemDto) {
        return ResponseEntity.ok(invoiceService.addItem(id, itemDto));
    }

    /** Remove a line item */
    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<InvoiceDTO> removeItem(
            @PathVariable Long id, @PathVariable Long itemId) {
        return ResponseEntity.ok(invoiceService.removeItem(id, itemId));
    }

    /** Record a payment */
    @PostMapping("/{id}/payments")
    public ResponseEntity<PaymentDTO> recordPayment(
            @PathVariable Long id, @RequestBody PaymentDTO paymentDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.recordPayment(id, paymentDto));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<PaymentDTO>> getPayments(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getPaymentsByInvoice(id));
    }

    @GetMapping("/patient/{patientId}/payments")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(invoiceService.getPaymentsByPatient(patientId));
    }

    @GetMapping("/payments/all")
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(invoiceService.getAllPayments());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<InvoiceDTO> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.cancelInvoice(id));
    }
}
