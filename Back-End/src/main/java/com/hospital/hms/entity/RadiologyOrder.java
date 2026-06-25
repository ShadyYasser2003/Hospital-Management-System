package com.hospital.hms.entity;

import com.hospital.hms.Enum.RadiologyOrderStatus;
import com.hospital.hms.Enum.RadiologyOrderType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "radiology_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RadiologyOrder  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String patientName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private String doctorName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private Technician technician;

    private String technicianName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RadiologyOrderType orderType;

    private String bodyPart;

    @Column(columnDefinition = "TEXT")
    private String clinicalIndication;

    private String contrast;

    @Column(columnDefinition = "TEXT")
    private String specialInstructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RadiologyOrderStatus status = RadiologyOrderStatus.ORDERED;

    private LocalDateTime orderedAt;
    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;

    @Column(columnDefinition = "LONGTEXT")
    private String reportFindings;

    @Column(columnDefinition = "TEXT")
    private String impression;

    private String imageUrl;

    private Boolean isCritical = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
