package com.hospital.hms.service.implementation;

import com.hospital.hms.service.KashierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.codec.Hex;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class KashierServiceImpl implements KashierService {

    @Value("${kashier.api-key}")
    private String apiKey;

    @Value("${kashier.secret-key}")
    private String secretKey;

    @Value("${kashier.merchant-id}")
    private String merchantId;

    @Value("${kashier.mode}")
    private String mode;

    @Value("${kashier.redirect-url:http://localhost:8080/api/kashier/payment/success}")
    private String redirectUrl;

    @Value("${kashier.webhook-url:http://localhost:8080/api/kashier/webhook}")
    private String webhookUrl;

    private final RestTemplate restTemplate;

    @Override
    public String createPaymentUrl(Long invoiceId, Double amount, String currency) {
        String url = "test".equals(mode)
                ? "https://test-api.kashier.io/v3/payment/sessions"
                : "https://api.kashier.io/v3/payment/sessions";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", secretKey);
        headers.set("api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String expireAt = java.time.Instant.now().plusSeconds(3600).toString();

        Map<String, Object> body = new HashMap<>();
        body.put("merchantId", merchantId);
        body.put("amount", String.format("%.2f", amount));
        body.put("currency", currency);
        // Append timestamp to order ID to ensure a unique session each attempt
        body.put("order", invoiceId + "-" + System.currentTimeMillis());
        body.put("expireAt", expireAt);
        body.put("maxFailureAttempts", 3);
        body.put("type", "one-time");
        body.put("display", "en");
        body.put("allowedMethods", "card,wallet,instapay");
        body.put("merchantRedirect", redirectUrl);
        body.put("serverWebhook", webhookUrl);

        Map<String, Object> customer = new HashMap<>();
        customer.put("email", "customer@hospital.com");
        customer.put("reference", invoiceId.toString());
        body.put("customer", customer);

        Map<String, Object> metaData = new HashMap<>();
        metaData.put("invoiceId", invoiceId);        // real invoice id for webhook
        body.put("metaData", metaData);
        body.put("failureRedirect", false);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().get("sessionUrl").toString();
            }
        } catch (HttpClientErrorException e) {
            log.error("Kashier error: {}", e.getResponseBodyAsString());

            // Kashier returns a sessionUrl even when a session already exists.
            // Parse and reuse it instead of throwing.
            try {
                String errorBody = e.getResponseBodyAsString();
                com.google.gson.JsonObject json = new com.google.gson.Gson()
                        .fromJson(errorBody, com.google.gson.JsonObject.class);
                if (json != null && json.has("sessionUrl")) {
                    String existingUrl = json.get("sessionUrl").getAsString();
                    log.info("Reusing existing Kashier session: {}", existingUrl);
                    return existingUrl;
                }
            } catch (Exception parseEx) {
                log.warn("Could not parse Kashier error body: {}", parseEx.getMessage());
            }

            throw new RuntimeException("Kashier payment failed: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Kashier session creation failed: ", e);
            throw new RuntimeException("Kashier payment failed: " + e.getMessage());
        }

        throw new RuntimeException("No sessionUrl returned from Kashier");
    }

    @Override
    public boolean verifyWebhookSignature(Map<String, Object> data, String receivedSignature) {
        try {
            List<String> signatureKeys = (List<String>) data.get("signatureKeys");
            Collections.sort(signatureKeys);

            StringBuilder payload = new StringBuilder();
            for (int i = 0; i < signatureKeys.size(); i++) {
                String key = signatureKeys.get(i);
                String value = data.get(key).toString();
                payload.append(key).append("=").append(value);
                if (i < signatureKeys.size() - 1) payload.append("&");
            }

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec sk = new SecretKeySpec(apiKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(sk);
            String computed = new String(Hex.encode(
                    mac.doFinal(payload.toString().getBytes(StandardCharsets.UTF_8))));

            return computed.equals(receivedSignature);
        } catch (Exception e) {
            log.error("Signature verification failed: ", e);
            return false;
        }
    }
}
