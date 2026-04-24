package com.hospital.hms.entity;

import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "technicians")
@Setter
@Getter
@PrimaryKeyJoinColumn(name = "tech_id")
/*@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder*/
public class Technician extends User{

    public Technician(Long id, String username, String nationalId, String password, String name, LocalDate dateOfBirth, String email, String phone, String address, UserRole role, String avatar, UserStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        super(id, username, nationalId, password, name, dateOfBirth, email, phone, address, role, avatar, status, createdAt, updatedAt);
    }

    public Technician() {
    }

}
