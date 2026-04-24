package com.hospital.hms.entity;

import com.hospital.hms.Enum.EmploymentStatus;
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
@Table(name = "nurses")
@Setter
@Getter
@PrimaryKeyJoinColumn(name = "nurse_id")
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Nurse extends User{
        @Column(nullable = false)
        private String licenseNumber;
        private String specialization;      //ICU, emergency, pediatrics
        private Integer yearsOfExperience;

        private LocalDate hireDate;
        private EmploymentStatus employmentStatus;
        private String shift;// day , night, rotation
        private Integer patientLoad;
        @ManyToMany(mappedBy = "nurses")
        private List<Admin> admins= new ArrayList<>();
        @ManyToOne
        @JoinColumn(name = "department_id")
        private Department department;
        @ManyToMany
        private List<Patient> patients= new ArrayList<>();
        @ManyToOne
        @JoinColumn(name = "speciality_id")
        private Speciality speciality;
    /*  private String ward;
        private String supervisorId;-> head nurse  */



    public Nurse(Long id, String username, String nationalId, String password, String name, LocalDate dateOfBirth, String email, String phone, String address, String avatar, LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, username, nationalId, password, name, dateOfBirth, email, phone, address, UserRole.NURSE, avatar, UserStatus.ACTIVE, createdAt, updatedAt);
    }
}
