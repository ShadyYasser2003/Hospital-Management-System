package com.hospital.hms.mapper;

import com.hospital.hms.dto.AppointmentDTO;
import com.hospital.hms.entity.Appointment;

public class AppointmentMapper {

    public static AppointmentDTO mapToAppointmentDTO(Appointment appointment) {
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatientName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctorName())
                .department(appointment.getDepartment())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .type(appointment.getType().toString())
                .status(appointment.getStatus().toString())
                .notes(appointment.getNotes())
                .build();

    }
}