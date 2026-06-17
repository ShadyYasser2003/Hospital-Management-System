package com.hospital.hms.entity;

import com.hospital.hms.Enum.Gender;
import com.hospital.hms.Enum.PatientStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Setter
@Getter
@PrimaryKeyJoinColumn(name = "patient_id")
@SuperBuilder
public class Patient extends User{
    public Patient() {
    }

    public Patient(Long id, String username, String nationalId, String password, String name, LocalDate dateOfBirth, String email, String phone, String address, UserRole role, String avatar, UserStatus userStatus, LocalDateTime createdAt, LocalDateTime updatedAt, Gender gender, String bloodType, String emergencyContact, String insuranceProvider, String insuranceNumber, String allergies, String medicalHistory, String diagnosis, String notes, PatientStatus patientStatus, String bloodPressure, String temperature, String pulse, String weight, String height, LocalDateTime vitalsLastUpdated, LocalDateTime createdAt1, LocalDateTime updatedAt1) {
        super(id, username, nationalId, password, name, dateOfBirth, email, phone, address, UserRole.PATIENT, avatar, userStatus, createdAt, updatedAt);
        this.gender = gender;
        this.bloodType = bloodType;
        this.emergencyContact = emergencyContact;
        this.insuranceProvider = insuranceProvider;
        this.insuranceNumber = insuranceNumber;
        this.allergies = allergies;
        this.medicalHistory = medicalHistory;
        this.diagnosis = diagnosis;
        this.notes = notes;
        this.patientStatus = patientStatus;
        this.bloodPressure = bloodPressure;
        this.temperature = temperature;
        this.pulse = pulse;
        this.weight = weight;
        this.height = height;
        this.vitalsLastUpdated = vitalsLastUpdated;
        this.createdAt = createdAt1;
        this.updatedAt = updatedAt1;
    }

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(nullable = false)
    private String bloodType;
    @Column(nullable = false)
    private String emergencyContact;

    private String insuranceProvider;
    private String insuranceNumber;

    @Column(columnDefinition = "LONGTEXT")
    private String allergies;

    @Column(columnDefinition = "LONGTEXT")
    private String medicalHistory;

    private String diagnosis;
    private String notes;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PatientStatus patientStatus = PatientStatus.ACTIVE;

    private String bloodPressure;
    private String temperature;
    private String pulse;
    private String weight;
    private String height;
    private LocalDateTime vitalsLastUpdated;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @ManyToMany(mappedBy = "patients")
    private List<Department> departments= new ArrayList<>();
    @ManyToMany(mappedBy = "patients")
    private List<Admin> admins= new ArrayList<>();
    @ManyToMany(mappedBy = "patients")
    private List<Doctor> doctors= new ArrayList<>();
    @ManyToMany(mappedBy = "patients")
    private List<Nurse> nurses= new ArrayList<>();
    @OneToMany(mappedBy = "patient")
    private List<MedicineDispensation> dispensationList= new ArrayList<>();
    @OneToMany(mappedBy = "patient")
    private List<Prescription> prescriptions= new ArrayList<>();
}
