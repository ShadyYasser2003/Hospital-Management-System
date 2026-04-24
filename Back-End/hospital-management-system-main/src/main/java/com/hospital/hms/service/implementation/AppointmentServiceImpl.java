package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.AppointmentStatus;
import com.hospital.hms.Enum.AppointmentType;
import com.hospital.hms.dto.AppointmentDTO;
import com.hospital.hms.entity.Appointment;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.User;
import com.hospital.hms.exception.AppointmentNotFoundException;
import com.hospital.hms.exception.PatientNotFoundException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.AppointmentMapper;
import com.hospital.hms.repository.AppointmentRepository;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public List<AppointmentDTO> getAllAppointments() {
        return    appointmentRepository.findAll()
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList()
                ;
    }

    @Override
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Appointment not found"));
        return AppointmentMapper.mapToAppointmentDTO(appointment);
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException("Patient not found"));
        return  appointmentRepository.findByPatient(patient)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();

    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new UserNotFoundException("Doctor not found"));
        return appointmentRepository.findByDoctor(doctor)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();

    }

    @Override
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        Patient patient = patientRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException("Patient not found"));

        Doctor doctor = doctorRepository.findById(appointmentDTO.getDoctorId())
                .orElseThrow(() -> new UserNotFoundException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setPatientName(patient.getName());
        appointment.setDoctor(doctor);
        appointment.setDoctorName(doctor.getName());
        appointment.setDepartment(appointmentDTO.getDepartment());
        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setAppointmentTime(appointmentDTO.getAppointmentTime());
        // normalize type: "follow-up" → "FOLLOW_UP"
        String normalizedType = appointmentDTO.getType().toUpperCase().replace("-", "_");
        appointment.setType(AppointmentType.valueOf(normalizedType));
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setNotes(appointmentDTO.getNotes());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return AppointmentMapper.mapToAppointmentDTO(savedAppointment);
    }

    @Override
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        appointment.setAppointmentDate(appointmentDTO.getAppointmentDate());
        appointment.setAppointmentTime(appointmentDTO.getAppointmentTime());
        appointment.setDepartment(appointmentDTO.getDepartment());
        appointment.setNotes(appointmentDTO.getNotes());
        // normalize type: "follow-up" → "FOLLOW_UP", "consultation" → "CONSULTATION"
        String normalizedType = appointmentDTO.getType().toUpperCase().replace("-", "_");
        appointment.setType(AppointmentType.valueOf(normalizedType));
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return AppointmentMapper.mapToAppointmentDTO(updatedAppointment);
    }

    @Override
    public AppointmentDTO confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return AppointmentMapper.mapToAppointmentDTO(updatedAppointment);
    }

    @Override
    public AppointmentDTO completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return AppointmentMapper.mapToAppointmentDTO(updatedAppointment);
    }

    @Override
    public AppointmentDTO cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return AppointmentMapper.mapToAppointmentDTO(updatedAppointment);
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));
        appointmentRepository.delete(appointment);
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
        return appointmentRepository.findByStatus(appointmentStatus)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList()
                ;

    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date) {
        return   appointmentRepository.findByAppointmentDate(date)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList()
                ;

    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDepartment(String department) {
        return  appointmentRepository.findByDepartment(department)
                .stream()
                .map(AppointmentMapper::mapToAppointmentDTO)
                .toList();

    }

}