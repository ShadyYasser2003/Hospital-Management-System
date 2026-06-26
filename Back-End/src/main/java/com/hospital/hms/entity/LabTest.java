package com.hospital.hms.entity;

import com.hospital.hms.Enum.LabTestStatus;
import com.hospital.hms.Enum.LabTestType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTest {
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
    private LabTestType testType;

    private String testName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LabTestStatus status = LabTestStatus.ORDERED;

    private LocalDateTime orderedAt;
    private LocalDateTime sampleCollectedAt;
    private LocalDateTime completedAt;

    @Column(columnDefinition = "LONGTEXT")
    private String result;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String referenceRange;
    private Boolean isCritical = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
