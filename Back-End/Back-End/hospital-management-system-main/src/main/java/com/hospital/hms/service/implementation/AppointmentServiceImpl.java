package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.AppointmentStatus;
import com.hospital.hms.Enum.AppointmentType;
import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.AppointmentDTO;
import com.hospital.hms.entity.Appointment;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.exception.AppointmentNotFoundException;
import com.hospital.hms.exception.PatientNotFoundException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.AppointmentMapper;
import com.hospital.hms.repository.AppointmentRepository;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.repository.UserRepository;
import com.hospital.hms.service.AppointmentService;
import com.hospital.hms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;
    private final DoctorRepository      doctorRepository;
    private final UserRepository        userRepository;
    private final NotificationService   notificationService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String actionUrl) {
        try {
            notificationService.sendNotification(recipientId, title, message, type, actionUrl);
        } catch (Exception e) {
            log.warn("Notification skipped for user {}: {}", recipientId, e.getMessage());
        }
    }

    /** Resolve doctor — handles both doctors table and plain users table */
    private Doctor resolveDoctor(Long doctorId) {
        return doctorRepository.findById(doctorId).orElseGet(() -> {
            com.hospital.hms.entity.User u = userRepository.findById(doctorId)
                    .orElseThrow(() -> new UserNotFoundException("Doctor not found: " + doctorId));
            if (u.getRole() != com.hospital.hms.Enum.UserRole.DOCTOR) {
                throw new UserNotFoundException("User " + doctorId + " is not a doctor");
            }
            Doctor d = new Doctor();
            d.setId(u.getId());
            d.setName(u.getName());
            d.setUsername(u.getUsername());
            d.setEmail(u.getEmail());
            d.setPhone(u.getPhone());
            d.setNationalId(u.getNationalId());
            d.setRole(u.getRole());
            d.setUserStatus(u.getUserStatus());
            d.setPassword(u.getPassword());
            d.setAddress(u.getAddress());
            d.setDateOfBirth(u.getDateOfBirth());
            return doctorRepository.save(d);
        });
    }

    // ── read operations ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(AppointmentMapper::mapToAppointmentDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(Long id) {
        return AppointmentMapper.mapToAppointmentDTO(
                appointmentRepository.findById(id)
                        .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        return appointmentRepository.findByPatient(patient).stream()
                .map(AppointmentMapper::mapToAppointmentDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        // Use direct ID query to avoid doctor-table lookup issues
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(AppointmentMapper::mapToAppointmentDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        AppointmentStatus s = AppointmentStatus.valueOf(status.toUpperCase());
        return appointmentRepository.findByStatus(s).stream()
                .map(AppointmentMapper::mapToAppointmentDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date).stream()
                .map(AppointmentMapper::mapToAppointmentDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDepartment(String department) {
        return appointmentRepository.findByDepartment(department).stream()
                .map(AppointmentMapper::mapToAppointmentDTO).toList();
    }

    // ── write operations ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        Patient patient = patientRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));

        Doctor doctor = resolveDoctor(appointmentDTO.getDoctorId());

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setPatientName(patient.getName());
        appointment.setDoctor(doctor);
        appointment.setDoctorName(doctor.getName());
        appointment.setDepartment(appointmentDTO.getDepartment());
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setAppointmentTime(appointmentDTO.getAppointmentTime());
        String normalizedType = appointmentDTO.getType().toUpperCase().replace("-", "_");
        appointment.setType(AppointmentType.valueOf(normalizedType));
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setNotes(appointmentDTO.getNotes());

        Appointment saved = appointmentRepository.save(appointment);

        // Link the patient to the doctor so the doctor's patient list stays accurate.
        // Guard against duplicates and only persist when a new link is actually added.
        try {
            if (doctor.getPatients() == null || doctor.getPatients().stream()
                    .noneMatch(p -> p.getId().equals(patient.getId()))) {
                doctor.addPatient(patient);
                doctorRepository.save(doctor);
            }
        } catch (Exception e) {
            log.warn("Could not link patient {} to doctor {}: {}",
                    patient.getId(), doctor.getId(), e.getMessage());
        }

        notify(patient.getId(),
                "Appointment Booked",
                "Your appointment with Dr. " + doctor.getName() + " on " +
                        appointmentDTO.getAppointmentDate() + " at " + appointmentDTO.getAppointmentTime() + " has been booked.",
                NotificationType.APPOINTMENT_REMINDER,
                "/patient/appointments/" + saved.getId());

        notify(doctor.getId(),
                "New Appointment",
                "New appointment booked with patient " + patient.getName() + " on " +
                        appointmentDTO.getAppointmentDate() + " at " + appointmentDTO.getAppointmentTime(),
                NotificationType.APPOINTMENT_REMINDER,
                "/doctor/appointments/" + saved.getId());

        return AppointmentMapper.mapToAppointmentDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setAppointmentTime(appointmentDTO.getAppointmentTime());
        appointment.setDepartment(appointmentDTO.getDepartment());
        appointment.setNotes(appointmentDTO.getNotes());
        String normalizedType = appointmentDTO.getType().toUpperCase().replace("-", "_");
        appointment.setType(AppointmentType.valueOf(normalizedType));
        return AppointmentMapper.mapToAppointmentDTO(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public AppointmentDTO confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment saved = appointmentRepository.save(appointment);

        notify(appointment.getPatient().getId(),
                "Appointment Confirmed",
                "Your appointment with Dr. " + appointment.getDoctorName() + " on " +
                        appointment.getAppointmentDate() + " has been confirmed.",
                NotificationType.APPOINTMENT_CONFIRMED,
                "/patient/appointments/" + saved.getId());

        return AppointmentMapper.mapToAppointmentDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDTO completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        return AppointmentMapper.mapToAppointmentDTO(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public AppointmentDTO cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELLED);

        Appointment saved = appointmentRepository.save(appointment);

        notify(appointment.getPatient().getId(),
                "Appointment Cancelled",
                "Your appointment with Dr. " + appointment.getDoctorName() + " on " +
                        appointment.getAppointmentDate() + " has been cancelled.",
                NotificationType.APPOINTMENT_CANCELLED,
                "/patient/appointments/" + saved.getId());

        return AppointmentMapper.mapToAppointmentDTO(saved);
    }

    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointmentRepository.delete(appointment);
    }
}
