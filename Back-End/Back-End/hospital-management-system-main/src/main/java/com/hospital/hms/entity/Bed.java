package com.hospital.hms.entity;

import com.hospital.hms.Enum.BedStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "beds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bedNumber;

    @Column(nullable = false)
    private String wardName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BedStatus status = BedStatus.AVAILABLE;

    @OneToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private String patientName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
