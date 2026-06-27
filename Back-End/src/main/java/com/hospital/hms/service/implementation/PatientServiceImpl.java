package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.Gender;
import com.hospital.hms.Enum.PatientStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.exception.EmailAlreadyExistException;
import com.hospital.hms.exception.NationalIDAlreadyExists;
import com.hospital.hms.exception.PatientNotFoundException;
import com.hospital.hms.mapper.PatientMapper;
import com.hospital.hms.repository.NurseRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.repository.PrescriptionRepository;
import com.hospital.hms.service.NotificationService;
import com.hospital.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final PrescriptionRepository prescriptionRepository;
    private final NurseRepository nurseRepository;
    private final NotificationService notificationService;

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Patient notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }
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
        if (patientDTO.getStatus() != null) {
            try {
                PatientStatus newStatus = com.hospital.hms.Enum.PatientStatus.valueOf(patientDTO.getStatus().toUpperCase().trim());
                // Guard: patient must have at least one prescription before being admitted
                if (newStatus == PatientStatus.ADMITTED) {
                    if (!prescriptionRepository.existsByPatient_Id(patient.getId())) {
                        throw new RuntimeException(
                            "Patient must have at least one prescription from a doctor before being admitted.");
                    }
                }
                patient.setPatientStatus(newStatus);
                // auto-stamp admission/discharge dates
                if (newStatus == PatientStatus.ADMITTED && patient.getAdmissionDate() == null) {
                    patient.setAdmissionDate(LocalDateTime.now());
                    patient.setDischargeDate(null);
                    // Notify all nurses about new admission
                    final String patientName = patient.getName();
                    final Long patientId = patient.getId();
                    try {
                        nurseRepository.findAll().forEach(nurse ->
                            notify(nurse.getId(),
                                    "New Patient Admitted",
                                    "Patient " + patientName + " has been admitted. Please monitor their care.",
                                    NotificationType.GENERAL,
                                    "/nurse/patients"));
                    } catch (Exception e) {
                        log.warn("Could not notify nurses about admission: {}", e.getMessage());
                    }
                    // Notify the patient
                    notify(patientId,
                            "You Have Been Admitted",
                            "You have been admitted to the hospital. Our nursing team will take care of you.",
                            NotificationType.GENERAL,
                            "/patient/history");
                } else if (newStatus == PatientStatus.DISCHARGED) {
                    if (patient.getDischargeDate() == null)
                        patient.setDischargeDate(LocalDateTime.now());
                    // Notify patient of discharge
                    notify(patient.getId(),
                            "Discharge Confirmed",
                            "You have been discharged. Please follow your doctor's instructions.",
                            NotificationType.GENERAL,
                            "/patient/history");
                }
            } catch (IllegalArgumentException ignored) {}
        }
        if (patientDTO.getAdmissionDate() != null && !patientDTO.getAdmissionDate().isBlank()) {
            try { patient.setAdmissionDate(java.time.LocalDateTime.parse(patientDTO.getAdmissionDate())); }
            catch (Exception e) {
                try { patient.setAdmissionDate(java.time.LocalDate.parse(patientDTO.getAdmissionDate()).atStartOfDay()); }
                catch (Exception ignored) {}
            }
        }
        if (patientDTO.getDischargeDate() != null && !patientDTO.getDischargeDate().isBlank()) {
            try { patient.setDischargeDate(java.time.LocalDateTime.parse(patientDTO.getDischargeDate())); }
            catch (Exception e) {
                try { patient.setDischargeDate(java.time.LocalDate.parse(patientDTO.getDischargeDate()).atStartOfDay()); }
                catch (Exception ignored) {}
            }
        }
        if (patientDTO.getBedChargePerDay() != null)
            patient.setBedChargePerDay(patientDTO.getBedChargePerDay());
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

