package com.hospital.hms.controller;

import com.hospital.hms.dto.PaymentDTO;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.PaypalService;
import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/paypal")
@RequiredArgsConstructor
@Slf4j
public class PaypalController {

    private final PaypalService paypalService;
    private final InvoiceService invoiceService;

    /** Called by frontend to initiate PayPal payment for an invoice */
    @PostMapping("/payment/create")
    public ResponseEntity<?> createPayment(
            @RequestParam Double amount,
            @RequestParam String currency,
            @RequestParam Long invoiceId,
            @RequestParam(defaultValue = "USD") String description) {
        try {
            String cancelUrl  = "http://localhost:8080/api/paypal/payment/cancel?invoiceId="  + invoiceId;
            String successUrl = "http://localhost:8080/api/paypal/payment/success?invoiceId=" + invoiceId;

            Payment payment = paypalService.createPayment(
                    amount, currency, "paypal", "sale",
                    "Invoice #" + invoiceId, cancelUrl, successUrl);

            for (Links link : payment.getLinks()) {
                if ("approval_url".equals(link.getRel())) {
                    return ResponseEntity.ok(Map.of("redirectUrl", link.getHref()));
                }
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No approval URL from PayPal"));
        } catch (PayPalRESTException e) {
            log.error("PayPal create failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "PayPal payment creation failed"));
        }
    }

    /** PayPal redirects here after user approves payment */
    @GetMapping("/payment/success")
    public ResponseEntity<?> paymentSuccess(
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID")   String payerId,
            @RequestParam("invoiceId") Long invoiceId) {
        try {
            Payment payment = paypalService.executePayment(paymentId, payerId);
            if ("approved".equals(payment.getState())) {
                PaymentDTO dto = new PaymentDTO();
                dto.setPaymentMethod("CARD");
                dto.setReferenceNumber(paymentId);
                dto.setAmount(Double.parseDouble(
                        payment.getTransactions().get(0).getAmount().getTotal()));
                return ResponseEntity.ok(invoiceService.recordPayment(invoiceId, dto));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Payment not approved"));
        } catch (PayPalRESTException e) {
            log.error("PayPal execute failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Payment execution failed"));
        }
    }

    @GetMapping("/payment/cancel")
    public ResponseEntity<?> paymentCancel(@RequestParam Long invoiceId) {
        return ResponseEntity.ok(Map.of(
                "status", "CANCELLED",
                "invoiceId", invoiceId,
                "message", "Payment was cancelled"));
    }
}
