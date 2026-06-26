package com.hospital.hms.service;

import java.util.Map;

public interface KashierService {
    String createPaymentUrl(Long invoiceId, Double amount, String currency);
    boolean verifyWebhookSignature(Map<String, Object> data, String receivedSignature);
}
