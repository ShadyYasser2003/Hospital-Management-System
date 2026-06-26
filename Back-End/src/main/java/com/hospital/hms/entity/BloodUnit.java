package com.hospital.hms.entity;

import com.hospital.hms.Enum.BloodType;
import com.hospital.hms.Enum.BloodUnitStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a physical bag/unit of blood held in the blood bank inventory.
 * Each row tracks one donation batch of a specific blood type and quantity.
 */
@Entity
@Table(name = "blood_units")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Blood group (e.g. A_POSITIVE, O_NEGATIVE). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    /** Number of available units in this batch. Reduced on reservation. */
    @Column(nullable = false)
    private Integer quantity;

    /** Date after which this unit should not be used. */
    private LocalDate expiryDate;

    /**
     * Lifecycle status:
     *   AVAILABLE → may be reserved
     *   RESERVED  → allocated to a blood request, not yet used
     *   USED      → dispensed; request completed
     *   EXPIRED   → past expiry date
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodUnitStatus status = BloodUnitStatus.AVAILABLE;

    /** Optional notes (donor info, bag number, etc.). */
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
