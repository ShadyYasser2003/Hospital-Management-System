package com.hospital.hms.controller;

import com.hospital.hms.dto.PaymentDTO;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.KashierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/kashier")
@RequiredArgsConstructor
@Slf4j
public class KashierController {

    private final KashierService kashierService;
    private final InvoiceService invoiceService;

    /**
     * Kashier sends a POST webhook after payment completes.
     * Body: { "event": "pay", "hash": "...", "data": { "status": "SUCCESS", ... } }
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> body) {
        Map<String, Object> data = (Map<String, Object>) body.get("data");
        String receivedHash = body.get("hash").toString();

        if (!kashierService.verifyWebhookSignature(data, receivedHash)) {
            log.warn("Kashier webhook signature mismatch");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid signature"));
        }

        String event  = body.get("event").toString();
        String status = data.get("status").toString();

        if ("pay".equals(event) && "SUCCESS".equals(status)) {
            Map<String, Object> metaData = (Map<String, Object>) data.get("metaData");
            Long invoiceId = Long.parseLong(metaData.get("invoiceId").toString());

            Double amount = Double.parseDouble(data.get("amount").toString()) / 100.0;
            String transactionId = data.get("transactionId").toString();

            PaymentDTO dto = new PaymentDTO();
            dto.setPaymentMethod("CARD");
            dto.setReferenceNumber(transactionId);
            dto.setAmount(amount);

            invoiceService.recordPayment(invoiceId, dto);
            log.info("Kashier payment recorded — invoice: {}, amount: {}", invoiceId, amount);
        }

        return ResponseEntity.ok().build();
    }

    /** Kashier redirects the browser here after success */
    @GetMapping("/payment/success")
    public ResponseEntity<?> success(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Payment completed — awaiting webhook confirmation"));
    }

    @GetMapping("/payment/failure")
    public ResponseEntity<?> failure() {
        return ResponseEntity.ok(Map.of("status", "FAILED"));
    }
}
