package com.hospital.hms.entity;

import com.hospital.hms.Enum.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Reference number (card transaction ID, insurance claim number, etc.) */
    private String referenceNumber;

    @Column(nullable = false, updatable = false)
    private LocalDateTime paidAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
}
