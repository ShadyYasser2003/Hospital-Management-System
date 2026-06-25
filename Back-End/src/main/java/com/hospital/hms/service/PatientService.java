package com.hospital.hms.service;

import com.hospital.hms.dto.PatientDTO;

import java.util.List;

public interface PatientService {
    public List<PatientDTO> getAllPatients();
    public PatientDTO getPatientById(Long id);
    public PatientDTO getPatientByNationalId(String nationalId);
    public PatientDTO createPatient(PatientDTO patientDTO);
    public PatientDTO updatePatient(Long id, PatientDTO patientDTO);
    public PatientDTO updatePatientVitals(Long id, PatientDTO patientDTO);
    public void deletePatient(Long id);
    public List<PatientDTO> searchPatients(String query);
    public List<PatientDTO> getPatientsByStatus(String status);
}
