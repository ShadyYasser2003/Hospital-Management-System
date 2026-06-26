package com.hospital.hms.entity;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.TechnicianSpecialization;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "technicians")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "tech_id")
public class Technician extends User{
    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TechnicianSpecialization specialization;

    private Integer yearsOfExperience;
    private LocalDate hireDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentStatus employmentStatus = EmploymentStatus.FULL_TIME;

    private String shift; // DAY, NIGHT, ROTATION

    private String certifications; // comma-separated list

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "technician", fetch = FetchType.LAZY)
    private List<LabTest> labTests = new ArrayList<>();

    @OneToMany(mappedBy = "technician", fetch = FetchType.LAZY)
    private List<RadiologyOrder> radiologyOrders = new ArrayList<>();


    public Technician(Long id, String username, String nationalId, String password,
                      String name, LocalDate dateOfBirth, String email, String phone,
                      String address, String avatar, LocalDateTime createdAt,
                      LocalDateTime updatedAt) {


        super(id, username, nationalId, password, name, dateOfBirth, email, phone,
                address, UserRole.TECHNICIAN, avatar, UserStatus.ACTIVE, createdAt, updatedAt);
    }




}
