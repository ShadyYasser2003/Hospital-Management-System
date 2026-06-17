package com.hospital.hms.entity;

import com.hospital.hms.Enum.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private Double totalAmount = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double paidAmount = 0.0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "accountant_id")
    private Accountant accountant;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<Payment> payments = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void recalculateTotal() {
        this.totalAmount = items.stream()
                .mapToDouble(InvoiceItem::getTotal)
                .sum();
    }

    public void recalculatePaidAmount() {
        this.paidAmount = payments.stream()
                .mapToDouble(Payment::getAmount)
                .sum();
        if (paidAmount >= totalAmount) {
            this.status = InvoiceStatus.PAID;
        } else if (paidAmount > 0) {
            this.status = InvoiceStatus.PARTIAL;
        }
    }
}
