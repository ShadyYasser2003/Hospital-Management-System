package com.hospital.hms.entity;

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
@Table(name = "pharmacists")
@Setter
@Getter
@PrimaryKeyJoinColumn(name = "pharmacist_id")
/*@NoArgsConstructor*/
@AllArgsConstructor
@SuperBuilder
public class Pharmacist extends User{

    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String shift;             // day, night, rotating

    public Pharmacist() {
    }

    @ManyToOne
    private Department department;
    @OneToMany(mappedBy = "pharmacist")
    private List<MedicineDispensation> medicineDispensationList= new ArrayList<>();
    @OneToMany(mappedBy = "pharmacist")
    private List<Prescription> prescriptions= new ArrayList<>();
    @ManyToMany
    private List<MedicineCategory> categories= new ArrayList<>();
    @ManyToMany
    private List<Medicine> medicineList= new ArrayList<>();
    @ManyToMany
    private List<MedicineStock> medicineStocks= new ArrayList<>();
    @ManyToMany(mappedBy = "pharmacists")
    private List<Admin> admins= new ArrayList<>();
}
