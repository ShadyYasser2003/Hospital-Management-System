package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.PatientStatus;
import com.hospital.hms.dto.*;
import com.hospital.hms.entity.*;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.*;
import com.hospital.hms.repository.*;
import com.hospital.hms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final NurseRepository nurseRepository;
    private final PatientRepository patientRepsotiry;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PharmacistRepository pharmacistRepository;
    @Override
    public PharmacistDto assignPharmacistToDep(Long pharmacistId, Long departmentId) {
        Pharmacist pharmacist = pharmacistRepository.findById(pharmacistId)
                .orElseThrow(() -> new UserNotFoundException("Pharmacist not found with id: "+pharmacistId));
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("No such department"));

        if (pharmacist.getDepartment() != null) {
            Department oldDept = pharmacist.getDepartment();
            if (oldDept.getPharmacists() != null) {
                oldDept.getPharmacists().remove(pharmacist);
            }
        }
        if (department.getPharmacists() == null) {
            department.setPharmacists(new ArrayList<>());
        }
        pharmacist.setDepartment(department);
        if (!department.getPharmacists().contains(pharmacist)) {
            department.getPharmacists().add(pharmacist);
        }
        Pharmacist updatedPharmacist = pharmacistRepository.save(pharmacist);
        departmentRepository.save(department);
        return PharmacistMapper.mapToDto(updatedPharmacist);
    }
    @Override
    public NurseDto assignNurseToDep(Long nurseId, Long departmentId) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new UserNotFoundException("Nurse not found"));
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("No such department"));

        if (nurse.getDepartment() != null) {
            Department oldDept = nurse.getDepartment();
            if (oldDept.getNurses() != null) {
                oldDept.getNurses().remove(nurse);
            }
        }
        if (department.getNurses() == null) {
            department.setNurses(new ArrayList<>());
        }
        nurse.setDepartment(department);
        if (!department.getNurses().contains(nurse)) {
            department.getNurses().add(nurse);
        }
        Nurse updatedNurse = nurseRepository.save(nurse);
        departmentRepository.save(department);
        return NurseMapper.mapToNurseDto(updatedNurse);
    }
    @Override
    public DoctorDto assignDoctorToDep(Long doctorId, Long departmentId) {
        Doctor doctor= doctorRepository.findById(doctorId)
                .orElseThrow(()->new UserNotFoundException("Doctor not found"));
        Department department= departmentRepository.findById(departmentId)
                .orElseThrow(()->new RuntimeException("No such department"));
        if(doctor.getDepartment() != null){
            Department oldDept= doctor.getDepartment();
            if(oldDept.getDoctors() != null){
                oldDept.getDoctors().remove(doctor);
            }
        }
        if(department.getDoctors() == null){
            department.setDoctors(new ArrayList<>());
        }
        doctor.setDepartment(department);
        if (!department.getDoctors().contains(doctor)) {
            department.getDoctors().add(doctor);
        }
        Doctor updatedDoctor = doctorRepository.save(doctor);
        departmentRepository.save(department);

        return DoctorMapper.mapToDoctorDto(updatedDoctor);
    }

    @Override
    public List<UserDto> getAllStaffInDep(Long departmentId) {
        Department department= departmentRepository.findById(departmentId)
                .orElseThrow(()->new RuntimeException("No such department"));
        List<UserDto> staff = new ArrayList<>();
        if (department.getDoctors() != null) {
            staff.addAll(department.getDoctors().stream()
                    .map(UserMapper::mapToUserDto)
                    .toList());
        }
        if (department.getNurses() != null) {
            staff.addAll(department.getNurses().stream()
                    .map(UserMapper::mapToUserDto)
                    .toList());
        }
        if (department.getPharmacists() != null) {
            staff.addAll(department.getPharmacists().stream()
                    .map(UserMapper::mapToUserDto)
                    .toList());
        }
        return staff;
    }

    @Override
    public PatientDTO transferPatientBetweenDepartments
            (Long newDepartmentId,
             Long oldDepartmentId,
             Long patientId) {
        Department oldDept= departmentRepository.findById(oldDepartmentId)
                .orElseThrow(()->new RuntimeException("Department not found"));
        Department newDept= departmentRepository.findById(newDepartmentId)
                .orElseThrow(()->new RuntimeException("Department not found"));
        Patient patient= patientRepsotiry.findById(patientId)
                .orElseThrow(()->new UserNotFoundException("Patient not found"));
        if(patient.getDepartments() != null ){
            if(patient.getDepartments().contains(oldDept)){
                patient.getDepartments().remove(oldDept);
            }else{
                throw new RuntimeException("Patient isn't admitted to department: "+oldDept.getName());
            }
        }else{
            patient.setDepartments(new ArrayList<>());
        }
        if(oldDept.getPatients() != null){
            oldDept.getPatients().remove(patient);
        }
        if(newDept.getPatients() == null){
            newDept.setPatients(new ArrayList<>());
        }
        newDept.getPatients().add(patient);
        patient.getDepartments().add(newDept);
        departmentRepository.save(oldDept);
        departmentRepository.save(newDept);
        Patient savedPatient= patientRepsotiry.save(patient);
        return PatientMapper.mapToPatientDto(savedPatient);
    }

    @Override
    public PatientDTO addPatientToNewDepartment(Long patientId, Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("No such department"));
        Patient patient = patientRepsotiry.findById(patientId)
                .orElseThrow(() -> new UserNotFoundException("Patient not found"));

        if (patient.getDepartments() == null) {
            patient.setDepartments(new ArrayList<>());
        }
        if (patient.getDepartments().contains(department)) {
            throw new RuntimeException("Patient already in this department");
        }
        patient.getDepartments().add(department);
        if (department.getPatients() == null) {
            department.setPatients(new ArrayList<>());
        }
        department.getPatients().add(patient);

        departmentRepository.save(department);
        Patient updatedPatient = patientRepsotiry.save(patient);

        return PatientMapper.mapToPatientDto(updatedPatient);
    }

    @Override
    public PatientDTO assignPatientToDoctor(Long doctorId, Long patientId) {
        Patient patient= patientRepsotiry.findById(patientId)
                .orElseThrow(()-> new UserNotFoundException("Patient not found"));
        Doctor doctor= doctorRepository.findById(doctorId)
                .orElseThrow(()->new UserNotFoundException("Doctor not found"));
        if(patient.getDoctors() == null){
            patient.setDoctors(new ArrayList<>());
        }
        if(patient.getDoctors().contains(doctor)){
            throw new RuntimeException("Patient already assigned to this doctor");
        }
        patient.getDoctors().add(doctor);
        if(doctor.getPatients() == null){
            doctor.setPatients(new ArrayList<>());
        }
        doctor.getPatients().add(patient);

        Patient savedPatient= patientRepsotiry.save(patient);
        doctorRepository.save(doctor);
        return PatientMapper.mapToPatientDto(savedPatient);
    }

    @Override
    public List<PatientDTO> getPatientByDepartment(Long departmentId) {
        Department department= departmentRepository.findById(departmentId)
                        .orElseThrow(()->new RuntimeException("Department not found"));

        List<Patient> patients= department.getPatients();
        if(patients == null){
            return Collections.emptyList();
        }
        return patients.stream().map(PatientMapper::mapToPatientDto).toList();
    }

    @Override
    public List<PatientDTO> getPatientByStatus(String patientStatus) {
        if (patientStatus == null || patientStatus.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            PatientStatus enumStatus = PatientStatus.valueOf(patientStatus.toUpperCase());
            return patientRepsotiry.findByPatientStatus(enumStatus)
                    .stream()
                    .map(PatientMapper::mapToPatientDto)
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid employment status: " + patientStatus);
        }
    }
}
