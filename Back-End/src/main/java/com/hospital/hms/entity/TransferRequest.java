package com.hospital.hms.entity;

import com.hospital.hms.Enum.TransferStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "transfer_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferRequest {

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
    private Doctor requestedBy;

    @Column(nullable = false)
    private String requestedByName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_hospital_id", nullable = false)
    private ExternalHospital toHospital;

    @Column(nullable = false)
    private String toHospitalName;

    @Column(nullable = false)
    private String toHospitalEmail;



    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status = TransferStatus.PENDING;



    private Boolean includeLabTests = false;
    private Boolean includeRadiology = false;
    private Boolean includeDiagnoses = false;



    private LocalDateTime transferredAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}