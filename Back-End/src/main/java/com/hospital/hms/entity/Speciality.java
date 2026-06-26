package com.hospital.hms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.engine.internal.Nullability;

import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Speciality {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    private String description;
    @NotNull
    private String status; //active, not-active
    @ManyToMany(mappedBy = "specialities")
    private List<Admin> admins= new ArrayList<>();
    @OneToMany(mappedBy = "speciality")
    private List<Nurse> nurses= new ArrayList<>();
    @OneToMany(mappedBy = "speciality")
    private List<Doctor> doctors= new ArrayList<>();
}
