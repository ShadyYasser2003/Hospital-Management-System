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
@Table(name = "technicians")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@PrimaryKeyJoinColumn(name = "tech_id")
public class Technician extends User {

    private String licenseNumber;

    /** e.g. "LAB", "RADIOLOGY", "IMAGING" */
    private String specialization;

    private Integer yearsOfExperience;
    private LocalDate hireDate;

    @Enumerated(EnumType.STRING)
    private EmploymentStatus employmentStatus;

    private String shift;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL)
    private List<TestRequest> testRequests = new ArrayList<>();

    public Technician(Long id, String username, String nationalId, String password,
                      String name, LocalDate dateOfBirth, String email, String phone,
                      String address, UserRole role, String avatar, UserStatus status,
                      LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, username, nationalId, password, name, dateOfBirth, email, phone,
              address, role, avatar, status, createdAt, updatedAt);
    }
}
