package com.hospital.hms.service;

import com.hospital.hms.dto.AppointmentDTO;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    public List<AppointmentDTO> getAllAppointments();
    public AppointmentDTO getAppointmentById(Long id) ;
    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) ;
    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId);
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO);
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) ;
    public AppointmentDTO confirmAppointment(Long id);
    public AppointmentDTO completeAppointment(Long id);
    public AppointmentDTO cancelAppointment(Long id);
    public void deleteAppointment(Long id);
    public List<AppointmentDTO> getAppointmentsByStatus(String status);
    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date);
    public List<AppointmentDTO> getAppointmentsByDepartment(String department);


}