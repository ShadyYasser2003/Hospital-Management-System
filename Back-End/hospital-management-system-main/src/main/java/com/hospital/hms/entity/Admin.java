package com.hospital.hms.entity;

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
@Table(name = "admin")
@Setter
@Getter
@SuperBuilder
@PrimaryKeyJoinColumn(name = "admin_id")
public class Admin extends User{

    @ManyToMany
    private List<Patient> patients= new ArrayList<>();
    @ManyToMany
    private List<Doctor> doctors= new ArrayList<>();
    @ManyToMany
    private List<Nurse> nurses= new ArrayList<>();
    @ManyToMany
    private List<Department> departments= new ArrayList<>();
    @ManyToMany
    private List<Speciality> specialities= new ArrayList<>();
    @ManyToMany
    private List<Receptionist> receptionists= new ArrayList<>();
    @ManyToMany
    private List<Pharmacist> pharmacists= new ArrayList<>();

    public Admin(Long id, String username, String nationalId, String password, String name, LocalDate dateOfBirth, String email, String phone, String address, UserRole role, String avatar, UserStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, username, nationalId, password, name, dateOfBirth, email, phone, address, UserRole.ADMIN, avatar, status, createdAt, updatedAt);
    }

    public Admin() {
    }

}
