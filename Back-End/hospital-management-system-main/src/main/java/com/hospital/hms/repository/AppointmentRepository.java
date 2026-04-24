package com.hospital.hms.repository;

import com.hospital.hms.Enum.AppointmentStatus;
import com.hospital.hms.entity.Appointment;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctor(User doctor);
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findByAppointmentDate(LocalDate date);
    List<Appointment> findByPatientAndStatus(Patient patient, AppointmentStatus status);
    List<Appointment> findByDoctorAndStatus(User doctor, AppointmentStatus status);
    List<Appointment> findByDepartment(String department);
}