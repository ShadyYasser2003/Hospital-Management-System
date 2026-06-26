package com.hospital.hms.entity;

import com.hospital.hms.Enum.DispensationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
public class MedicineDispensation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private int dispensedQuantity;
    @Column(nullable = false)
    private LocalDate dispensedDate;
    @Column(nullable = false)
    private DispensationStatus status;
    @Column(nullable = false)
    private Double charges;
    @ManyToOne
    private Pharmacist pharmacist;
    @ManyToOne
    private Prescription prescription;
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}
