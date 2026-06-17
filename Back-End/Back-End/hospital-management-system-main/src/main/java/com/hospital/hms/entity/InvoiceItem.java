package com.hospital.hms.entity;

import com.hospital.hms.Enum.InvoiceItemType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InvoiceItemType itemType;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Double total;

    /** Optional reference to the source entity (testRequestId, prescriptionId, etc.) */
    private Long referenceId;

    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        this.total = this.quantity * this.unitPrice;
    }
}
