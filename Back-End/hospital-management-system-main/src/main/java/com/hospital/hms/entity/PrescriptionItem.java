package com.hospital.hms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Entity
@Table(name = "prescription_items")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String dosage;

    @Column(nullable = false)
    private String frequency;

    @Column(nullable = false)
    private Integer duration;//in days

    @Column(nullable = false)
    private Integer quantity;

    private String instructions;

    private Boolean dispensed = false;

    private Integer dispensedQuantity = 0;
    @ManyToOne
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

}
