package com.hospital.hms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@SuperBuilder
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //dep. name
    private String name;
    private String description;
    private String location;
    private String budget;
    private boolean isActive;
    private int totalBeds;
    private int availableBeds;

    @ManyToMany
    private List<Patient> patients= new ArrayList<>();
    /*public void addPatient(Patient patient){
        patients.add(patient);
        patient.getDepartments().add(this);
    }
    public void removePatient(Patient patient){
        patients.remove(patient);
        patient.getDepartments().remove(this);
    }*/
    @OneToMany(mappedBy = "department")
    private List<Pharmacist> pharmacists= new ArrayList<>();
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<Doctor> doctors= new ArrayList<>();/*
    public void addDoctor(Doctor doctor){
        doctors.add(doctor);
        doctor.setDepartment(this);
    }
    public void removeDoctor(Doctor doctor){
        doctors.remove(doctor);
        doctor.setDepartment(null);
    }*/
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<Nurse> nurses = new ArrayList<>();
    /*public void addNurse(Nurse nurse){
        nurses.add(nurse);
        nurse.setDepartment(this);
    }
    public void removeNurse(Nurse nurse){
        nurses.add(nurse);
        nurse.setDepartment(null);
    }*/
    @OneToOne(cascade = CascadeType.PERSIST)
    private Doctor headOfDepartment;

    @ManyToMany(mappedBy = "departments")
    private List<Admin> admins= new ArrayList<>();
    @OneToMany(mappedBy = "department")
    private List<Receptionist> receptionists= new ArrayList<>();

}
