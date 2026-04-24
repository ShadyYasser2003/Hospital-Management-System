package com.hospital.hms.entity;


import com.hospital.hms.Enum.EmploymentStatus;
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
@Table(name = "doctors")
@Setter
@Getter
@PrimaryKeyJoinColumn(name = "doctor_id")
@AllArgsConstructor
//@NoArgsConstructor
@SuperBuilder
public class Doctor extends User{

    @Column(nullable = false)
    private String licenseNumber;
    @Column(nullable = false)
    private String specialization;
    private String qualification;
    private String medicalSchool;
    private Integer yearOfGraduation;
    private Integer yearsOfExperience;

    private LocalDate hireDate;
    private EmploymentStatus employmentStatus;
    private String shift;

    @ManyToMany(mappedBy = "doctors")
    private List<Admin> admins= new ArrayList<>();

    @ManyToOne
    private Department department;
    @OneToOne
    private Department managedDepartment;
    @ManyToMany
    private List<Patient> patients = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "speciality_id")
    private Speciality speciality;
    @OneToMany(mappedBy = "doctor")
    private List<Appointment> appointments= new ArrayList<>();
    @OneToMany(mappedBy = "doctor")
    private List<Prescription> prescriptions= new ArrayList<>();
    public void addPatient(Patient patient){
        patients.add(patient);
        patient.getDoctors().add(this);
    }
    public void removePatient(Patient patient){
        patients.remove(patient);
        patient.getDoctors().remove(this);
    }


    public Doctor() {
        super();
    }

    public Doctor(Long id, String username, String nationalId, String password, String name, LocalDate dateOfBirth, String email, String phone, String address,  String avatar,  LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, username, nationalId, password, name, dateOfBirth, email, phone, address, UserRole.DOCTOR, avatar, UserStatus.ACTIVE, createdAt, updatedAt);

    }
/*
    // Insurance and Billing
    private List<String> insuranceAccepted;       // Insurance providers they accept
    private String providerNumber;                 // Insurance provider number
    private boolean isRegisteredWithInsurance;

    // Schedule and Availability
    private String schedule;                    // Could be JSON or separate table
    private List<String> workingDays;           // e.g., ["MONDAY", "WEDNESDAY", "FRIDAY"]*/

}
