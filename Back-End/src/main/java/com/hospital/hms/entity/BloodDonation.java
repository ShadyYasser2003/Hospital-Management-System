package com.hospital.hms.entity;

import com.hospital.hms.Enum.BloodType;
import com.hospital.hms.Enum.DonationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Records a blood donation event.
 * On creation, a corresponding BloodUnit is automatically added to inventory.
 */
@Entity
@Table(name = "blood_donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodDonation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Donor info (external — not necessarily a system user) ──────────────
    @Column(nullable = false)
    private String donorName;

    private String donorPhone;

    private String donorNationalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private LocalDate donationDate;

    /** Expiry date of the donated blood (typically 42 days from donation) */
    private LocalDate expiryDate;

    private String notes;

    // ── Donation type ──────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationType donationType;

    /**
     * Filled only when donationType = SPECIFIC_PATIENT.
     * References the patient for whom this donation is directed.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient targetPatient;

    /** The BloodUnit record created from this donation */
    @OneToOne
    @JoinColumn(name = "blood_unit_id")
    private BloodUnit bloodUnit;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
