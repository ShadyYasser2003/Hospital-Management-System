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
import com.hospital.hms.service.AppointmentService;
import com.hospital.hms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;
    private final DoctorRepository      doctorRepository;
    private final NotificationService   notificationService;

    // ── Helpers ────────────────────────────────────────────────────────────

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Appointment notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }

    // ── Queries ────────────────────────────────────────────────────────────

    @Override
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();
    }

    @Override
    public AppointmentDTO getAppointmentById(Long id) {
        return AppointmentMapper.mapToAppointmentDTO(
                appointmentRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Appointment not found")));
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        return appointmentRepository.findByPatient(patient)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new UserNotFoundException("Doctor not found"));
        return appointmentRepository.findByDoctor(doctor)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();
    }

    // ── Create ─────────────────────────────────────────────────────────────

    @Override
    public AppointmentDTO createAppointment(AppointmentDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new UserNotFoundException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setPatientName(patient.getName());
        appointment.setDoctor(doctor);
        appointment.setDoctorName(doctor.getName());
        appointment.setDepartment(dto.getDepartment());
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        String normalizedType = dto.getType().toUpperCase().replace("-", "_");
        appointment.setType(AppointmentType.valueOf(normalizedType));
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setNotes(dto.getNotes());

        Appointment saved = appointmentRepository.save(appointment);

        // Notify patient
        notify(patient.getId(),
                "Appointment Scheduled",
                "Your appointment with Dr. " + doctor.getName() +
                " on " + saved.getAppointmentDate() + " at " + saved.getAppointmentTime() +
                " has been scheduled.",
                NotificationType.APPOINTMENT_CONFIRMED,
                "/patient/appointments");

        // Notify doctor
        notify(doctor.getId(),
                "New Appointment",
                "A new appointment with patient " + patient.getName() +
                " is scheduled for " + saved.getAppointmentDate() + " at " + saved.getAppointmentTime() + ".",
                NotificationType.APPOINTMENT_CONFIRMED,
                "/doctor/appointments");

        return AppointmentMapper.mapToAppointmentDTO(saved);
    }

    // ── Update ─────────────────────────────────────────────────────────────

    @Override
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setDepartment(dto.getDepartment());
        appointment.setNotes(dto.getNotes());
        String normalizedType = dto.getType().toUpperCase().replace("-", "_");
        appointment.setType(AppointmentType.valueOf(normalizedType));

        Appointment updated = appointmentRepository.save(appointment);

        // Notify patient of reschedule
        notify(updated.getPatient().getId(),
                "Appointment Updated",
                "Your appointment with Dr. " + updated.getDoctorName() +
                " has been rescheduled to " + updated.getAppointmentDate() +
                " at " + updated.getAppointmentTime() + ".",
                NotificationType.APPOINTMENT_REMINDER,
                "/patient/appointments");

        return AppointmentMapper.mapToAppointmentDTO(updated);
    }

    // ── Status changes ─────────────────────────────────────────────────────

    @Override
    public AppointmentDTO confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment updated = appointmentRepository.save(appointment);

        notify(updated.getPatient().getId(),
                "Appointment Confirmed",
                "Your appointment with Dr. " + updated.getDoctorName() +
                " on " + updated.getAppointmentDate() + " at " + updated.getAppointmentTime() +
                " has been confirmed.",
                NotificationType.APPOINTMENT_CONFIRMED,
                "/patient/appointments");

        return AppointmentMapper.mapToAppointmentDTO(updated);
    }

    @Override
    public AppointmentDTO completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        Appointment updated = appointmentRepository.save(appointment);

        notify(updated.getPatient().getId(),
                "Appointment Completed",
                "Your appointment with Dr. " + updated.getDoctorName() + " has been completed.",
                NotificationType.APPOINTMENT_COMPLETED,
                "/patient/appointments");

        return AppointmentMapper.mapToAppointmentDTO(updated);
    }

    @Override
    public AppointmentDTO cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updated = appointmentRepository.save(appointment);

        // Notify both patient and doctor
        notify(updated.getPatient().getId(),
                "Appointment Cancelled",
                "Your appointment with Dr. " + updated.getDoctorName() +
                " on " + updated.getAppointmentDate() + " has been cancelled.",
                NotificationType.APPOINTMENT_CANCELLED,
                "/patient/appointments");

        notify(updated.getDoctor().getId(),
                "Appointment Cancelled",
                "The appointment with patient " + updated.getPatientName() +
                " on " + updated.getAppointmentDate() + " has been cancelled.",
                NotificationType.APPOINTMENT_CANCELLED,
                "/doctor/appointments");

        return AppointmentMapper.mapToAppointmentDTO(updated);
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointmentRepository.delete(appointment);
    }

    // ── Filters ────────────────────────────────────────────────────────────

    @Override
    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        return appointmentRepository.findByStatus(AppointmentStatus.valueOf(status.toUpperCase()))
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDepartment(String department) {
        return appointmentRepository.findByDepartment(department)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();
    }
}
