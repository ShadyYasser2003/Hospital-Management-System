package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.Gender;
import com.hospital.hms.Enum.PatientStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.exception.EmailAlreadyExistException;
import com.hospital.hms.exception.NationalIDAlreadyExists;
import com.hospital.hms.exception.PatientNotFoundException;
import com.hospital.hms.mapper.PatientMapper;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    @Override
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(PatientMapper::mapToPatientDto)
                .toList();
    }

    @Override
    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id).orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        return PatientMapper.mapToPatientDto(patient);
    }

    @Override
    public PatientDTO getPatientByNationalId(String nationalId) {
            Patient patient = patientRepository.findByNationalId(nationalId)
                    .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
            return PatientMapper.mapToPatientDto(patient);
    }

    @Override
    public PatientDTO createPatient(PatientDTO patientDTO) {
        if (patientRepository.findByNationalId(patientDTO.getNationalId()).isPresent()) {
            throw new NationalIDAlreadyExists("National ID already exists");
        }
        if (patientRepository.findByEmail(patientDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyExistException("Email already exists");
        }

        Patient patient = new Patient();
        patient.setName(patientDTO.getName());
        patient.setNationalId(patientDTO.getNationalId());
        patient.setDateOfBirth(com.hospital.hms.config.DateUtils.parse(patientDTO.getDateOfBirth()));
        patient.setGender(Gender.valueOf(patientDTO.getGender().toUpperCase()));
        patient.setBloodType(patientDTO.getBloodType());
        patient.setRole(UserRole.PATIENT);
        patient.setUserStatus(UserStatus.ACTIVE);
        patient.setUsername(patientDTO.getUsername());
        patient.setPhone(patientDTO.getPhone());
        patient.setEmail(patientDTO.getEmail());
        patient.setPassword(passwordEncoder.encode(patientDTO.getPassword()));
        patient.setAddress(patientDTO.getAddress());
        patient.setEmergencyContact(patientDTO.getEmergencyContact());
        patient.setInsuranceProvider(patientDTO.getInsuranceProvider());
        patient.setInsuranceNumber(patientDTO.getInsuranceNumber());
        patient.setAllergies(patientDTO.getAllergies());
        patient.setMedicalHistory(patientDTO.getMedicalHistory());
        patient.setPatientStatus(PatientStatus.ACTIVE);

        Patient saved = patientRepository.save(patient);

        return PatientMapper.mapToPatientDto(saved);
    }

    @Override
    public PatientDTO updatePatient(Long id, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));

        if (patientDTO.getName() != null)             patient.setName(patientDTO.getName());
        if (patientDTO.getEmail() != null)            patient.setEmail(patientDTO.getEmail());
        if (patientDTO.getPhone() != null)            patient.setPhone(patientDTO.getPhone());
        if (patientDTO.getAddress() != null)          patient.setAddress(patientDTO.getAddress());
        if (patientDTO.getEmergencyContact() != null) patient.setEmergencyContact(patientDTO.getEmergencyContact());
        if (patientDTO.getAllergies() != null)         patient.setAllergies(patientDTO.getAllergies());
        if (patientDTO.getMedicalHistory() != null)   patient.setMedicalHistory(patientDTO.getMedicalHistory());
        if (patientDTO.getDiagnosis() != null)        patient.setDiagnosis(patientDTO.getDiagnosis());
        if (patientDTO.getNotes() != null)            patient.setNotes(patientDTO.getNotes());
        // vitals
        if (patientDTO.getBloodPressure() != null)    patient.setBloodPressure(patientDTO.getBloodPressure());
        if (patientDTO.getTemperature() != null)      patient.setTemperature(patientDTO.getTemperature());
        if (patientDTO.getPulse() != null)            patient.setPulse(patientDTO.getPulse());
        if (patientDTO.getWeight() != null)           patient.setWeight(patientDTO.getWeight());
        if (patientDTO.getHeight() != null)           patient.setHeight(patientDTO.getHeight());

        Patient updated = patientRepository.save(patient);
        return PatientMapper.mapToPatientDto(updated);
    }

    @Override
    public PatientDTO updatePatientVitals(Long id, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));

        patient.setBloodPressure(patientDTO.getBloodPressure());
        patient.setTemperature(patientDTO.getTemperature());
        patient.setPulse(patientDTO.getPulse());
        patient.setWeight(patientDTO.getWeight());
        patient.setHeight(patientDTO.getHeight());
        patient.setVitalsLastUpdated(LocalDateTime.now());

        Patient updated = patientRepository.save(patient);
        return PatientMapper.mapToPatientDto(updated) ;
    }

    @Override
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        patientRepository.delete(patient);
    }

    @Override
    public List<PatientDTO> searchPatients(String query) {
        return patientRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(PatientMapper::mapToPatientDto)
                .toList();

    }

    @Override
    public List<PatientDTO> getPatientsByStatus(String status) {
       PatientStatus patientStatus = PatientStatus.valueOf(status.toUpperCase());
        return patientRepository.findByPatientStatus(patientStatus)
                .stream()
                .map(PatientMapper::mapToPatientDto)
                .toList();
    }
    }

