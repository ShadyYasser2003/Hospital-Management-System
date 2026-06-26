package com.hospital.hms.controller;

import com.hospital.hms.dto.InvoiceDTO;
import com.hospital.hms.dto.InvoiceItemDTO;
import com.hospital.hms.dto.PaymentDTO;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.KashierService;
import com.hospital.hms.service.PaypalService;
import com.paypal.api.payments.Links;
import com.paypal.base.rest.PayPalRESTException;
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
    private final KashierService kashierService;
    private final PaypalService  paypalService;

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

    @PostMapping("/{id}/items")
    public ResponseEntity<InvoiceDTO> addItem(
            @PathVariable Long id, @RequestBody InvoiceItemDTO itemDto) {
        return ResponseEntity.ok(invoiceService.addItem(id, itemDto));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<InvoiceDTO> removeItem(
            @PathVariable Long id, @PathVariable Long itemId) {
        return ResponseEntity.ok(invoiceService.removeItem(id, itemId));
    }

    /**
     * Smart payment endpoint:
     * - PAYPAL  → creates PayPal session, returns { redirectUrl }
     * - KASHIER → creates Kashier session via KashierService, returns { redirectUrl }
     * - CASH / CARD / INSURANCE / BANK_TRANSFER → records immediately, returns PaymentDTO
     */
    @PostMapping("/{id}/payments")
    public ResponseEntity<?> pay(@PathVariable Long id, @RequestBody PaymentDTO paymentDto) {
        String method = paymentDto.getPaymentMethod() != null
                ? paymentDto.getPaymentMethod().toUpperCase() : "CASH";

        if ("PAYPAL".equals(method)) {
            try {
                String cancelUrl  = "http://localhost:8080/api/paypal/payment/cancel?invoiceId=" + id;
                String successUrl = "http://localhost:8080/api/paypal/payment/success?invoiceId=" + id;
                com.paypal.api.payments.Payment payment = paypalService.createPayment(
                        paymentDto.getAmount(), "USD", "paypal", "sale",
                        "Invoice #" + id, cancelUrl, successUrl);
                for (Links link : payment.getLinks()) {
                    if ("approval_url".equals(link.getRel())) {
                        return ResponseEntity.ok(java.util.Map.of("redirectUrl", link.getHref()));
                    }
                }
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "No approval URL from PayPal"));
            } catch (PayPalRESTException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "PayPal error: " + e.getMessage()));
            }
        }

        if ("KASHIER".equals(method) || "INSTAPAY".equals(method) || "CARD_ONLINE".equals(method)) {
            String currency = paymentDto.getNotes() != null && paymentDto.getNotes().contains("USD") ? "USD" : "EGP";
            String sessionUrl = kashierService.createPaymentUrl(id, paymentDto.getAmount(), currency);
            return ResponseEntity.ok(java.util.Map.of("redirectUrl", sessionUrl));
        }

        // CASH, CARD, INSURANCE, BANK_TRANSFER — record directly
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
