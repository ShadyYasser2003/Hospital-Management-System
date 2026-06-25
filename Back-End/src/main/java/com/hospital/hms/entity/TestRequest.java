package com.hospital.hms.entity;

import com.hospital.hms.Enum.TestRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String testType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String priority = "NORMAL";

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TestRequestStatus status = TestRequestStatus.PENDING;

    private String reportUrl;

    @Column(columnDefinition = "TEXT")
    private String results;

    private Double charges;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    /** Technician assigned — references users table (can be any TECHNICIAN role user) */
    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician;

    @PreUpdate
    protected void onUpdate() {
        if (status == TestRequestStatus.COMPLETED && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}
