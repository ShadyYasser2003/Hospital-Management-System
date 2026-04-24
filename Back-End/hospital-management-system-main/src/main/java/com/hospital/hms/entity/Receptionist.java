package com.hospital.hms.entity;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "receptionists")
@Setter
@Getter
@PrimaryKeyJoinColumn(name = "receptionist_id")
@SuperBuilder
public class Receptionist extends User{

    private String shift;// day , night, rotation
    private String specialityArea; //in patient, out patient
    private LocalDate hipaaTrainingDate;
    private LocalDate customerServiceTraining;
    private EmploymentStatus employmentStatus;
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
    @ManyToMany(mappedBy = "receptionists")
    private List<Admin> admins= new ArrayList<>();
    public Receptionist(Long id, String username, String nationalId, String password, String name, LocalDate dateOfBirth, String email, String phone, String address, UserRole role, String avatar, UserStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, username, nationalId, password, name, dateOfBirth, email, phone, address, role, avatar, status, createdAt, updatedAt);
    }

    public Receptionist() {
    }
}
