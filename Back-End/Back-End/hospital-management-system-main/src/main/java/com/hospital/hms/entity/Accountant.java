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
@Table(name = "accountants")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "accountant_id")
public class Accountant extends User {

    private String employeeNumber;

    @Enumerated(EnumType.STRING)
    private EmploymentStatus employmentStatus;

    private String shift;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "accountant", cascade = CascadeType.ALL)
    private List<Invoice> invoices = new ArrayList<>();

    public Accountant(Long id, String username, String nationalId, String password,
                      String name, LocalDate dateOfBirth, String email, String phone,
                      String address, UserRole role, String avatar, UserStatus status,
                      LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, username, nationalId, password, name, dateOfBirth, email, phone,
              address, role, avatar, status, createdAt, updatedAt);
    }
}
