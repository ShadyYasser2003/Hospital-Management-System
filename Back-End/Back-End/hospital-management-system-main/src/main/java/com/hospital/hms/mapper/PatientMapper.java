package com.hospital.hms.mapper;

import com.hospital.hms.Enum.Gender;
import com.hospital.hms.Enum.PatientStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.entity.Patient;

public class PatientMapper {

    public static PatientDTO mapToPatientDto(Patient patient) {
        return PatientDTO.builder()
                .id(patient.getId())
                .username(patient.getUsername())
                .name(patient.getName())
                // Never expose hashed password
                .nationalId(patient.getNationalId())
                .dateOfBirth(DateUtils.format(patient.getDateOfBirth()))
                .gender(patient.getGender() != null ? patient.getGender().toString() : null)
                .role(patient.getRole() != null ? patient.getRole().toString() : "PATIENT")
                .bloodType(patient.getBloodType())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .emergencyContact(patient.getEmergencyContact())
                .insuranceProvider(patient.getInsuranceProvider())
                .insuranceNumber(patient.getInsuranceNumber())
                .allergies(patient.getAllergies())
                .medicalHistory(patient.getMedicalHistory())
                .diagnosis(patient.getDiagnosis())
                .notes(patient.getNotes())
                .status(patient.getPatientStatus() != null ? patient.getPatientStatus().toString() : "ACTIVE")
                .bloodPressure(patient.getBloodPressure())
                .temperature(patient.getTemperature())
                .pulse(patient.getPulse())
                .weight(patient.getWeight())
                .height(patient.getHeight())
                .build();
    }

    public static Patient mapToPatient(PatientDTO patientDTO) {
        return Patient.builder()
                .id(patientDTO.getId())
                .name(patientDTO.getName())
                .password(patientDTO.getPassword())
                .nationalId(patientDTO.getNationalId())
                .dateOfBirth(DateUtils.parse(patientDTO.getDateOfBirth()))
                .gender(patientDTO.getGender() != null ? Gender.valueOf(patientDTO.getGender().toUpperCase()) : null)
                .bloodType(patientDTO.getBloodType())
                .phone(patientDTO.getPhone())
                .email(patientDTO.getEmail())
                .role(UserRole.PATIENT)
                .address(patientDTO.getAddress())
                .emergencyContact(patientDTO.getEmergencyContact())
                .insuranceProvider(patientDTO.getInsuranceProvider())
                .insuranceNumber(patientDTO.getInsuranceNumber())
                .allergies(patientDTO.getAllergies())
                .medicalHistory(patientDTO.getMedicalHistory())
                .diagnosis(patientDTO.getDiagnosis())
                .notes(patientDTO.getNotes())
                .patientStatus(patientDTO.getStatus() != null
                        ? PatientStatus.valueOf(patientDTO.getStatus().toUpperCase().trim())
                        : PatientStatus.ACTIVE)
                .bloodPressure(patientDTO.getBloodPressure())
                .temperature(patientDTO.getTemperature())
                .pulse(patientDTO.getPulse())
                .weight(patientDTO.getWeight())
                .height(patientDTO.getHeight())
                .build();
    }
}
