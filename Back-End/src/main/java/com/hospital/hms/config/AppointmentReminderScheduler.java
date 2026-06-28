package com.hospital.hms.config;

import com.hospital.hms.Enum.AppointmentStatus;
import com.hospital.hms.entity.Appointment;
import com.hospital.hms.repository.AppointmentRepository;
import com.hospital.hms.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Sends appointment reminder emails to patients 24 hours before their appointment.
 * Runs every hour to catch newly confirmed appointments.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService           emailService;

    /**
     * Every hour — find all CONFIRMED or PENDING appointments scheduled for tomorrow
     * and send a reminder email to the patient.
     */
    @Scheduled(cron = "0 0 * * * *")   // top of every hour
    public void sendReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        log.debug("[Reminder] Checking appointments for {}", tomorrow);

        List<Appointment> tomorrowAppts = appointmentRepository.findByAppointmentDate(tomorrow);

        int sent = 0;
        for (Appointment appt : tomorrowAppts) {
            // Only remind for active (non-cancelled) appointments
            if (appt.getStatus() == AppointmentStatus.CANCELLED
                    || appt.getStatus() == AppointmentStatus.COMPLETED) continue;

            String patientEmail = appt.getPatient() != null ? appt.getPatient().getEmail() : null;
            if (patientEmail == null || patientEmail.isBlank()) continue;

            try {
                String time = appt.getAppointmentTime() != null
                        ? appt.getAppointmentTime().toString().substring(0, 5)
                        : "—";

                emailService.sendAppointmentReminder(
                        patientEmail,
                        appt.getPatientName(),
                        appt.getDoctorName(),
                        tomorrow.toString(),
                        time,
                        appt.getDepartment());

                sent++;
                log.debug("[Reminder] Sent to {} for appt #{}", patientEmail, appt.getId());
            } catch (Exception e) {
                log.warn("[Reminder] Failed for appt #{}: {}", appt.getId(), e.getMessage());
            }
        }

        if (sent > 0) log.info("[Reminder] Sent {} appointment reminder(s) for {}", sent, tomorrow);
    }
}
