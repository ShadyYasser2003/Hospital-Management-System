package com.hospital.hms.entity;

import com.hospital.hms.Enum.BloodRequestStatus;
import com.hospital.hms.Enum.BloodRequestUrgency;
import com.hospital.hms.Enum.BloodType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A doctor's request for blood units on behalf of a patient.
 *
 * Status flow:
 *   PENDING   → stock unavailable at request time
 *   RESERVED  → auto-reserved from available stock at request time
 *   COMPLETED → fulfillRequest() called; units marked USED
 *   CANCELLED → cancelRequest() called; reserved units released back to AVAILABLE
 */
@Entity
@Table(name = "blood_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The patient who needs the blood. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    /** Denormalized for fast read without JOIN. */
    @Column(nullable = false)
    private String patientName;

    /** The doctor who placed the request. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor requestedBy;

    /** Denormalized for fast read without JOIN. */
    @Column(nullable = false)
    private String requestedByName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    /** Number of units requested. */
    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodRequestUrgency urgency = BloodRequestUrgency.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodRequestStatus status = BloodRequestStatus.PENDING;

    private String notes;

    /** Set when the request moves to COMPLETED. */
    private LocalDateTime fulfilledAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
