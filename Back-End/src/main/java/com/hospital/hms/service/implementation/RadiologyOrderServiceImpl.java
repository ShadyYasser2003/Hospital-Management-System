package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.RadiologyOrderStatus;
import com.hospital.hms.Enum.RadiologyOrderType;
import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.RadiologyOrderDto;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.RadiologyOrder;
import com.hospital.hms.entity.Technician;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.RadiologyOrderMapper;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.repository.RadiologyOrderRepository;
import com.hospital.hms.repository.TechnicianRepository;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.NotificationService;
import com.hospital.hms.service.RadiologyOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RadiologyOrderServiceImpl implements RadiologyOrderService {
    private final RadiologyOrderRepository radiologyOrderRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TechnicianRepository technicianRepository;
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;

    private static final DateTimeFormatter DT_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Radiology notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }


    @Override
    public List<RadiologyOrderDto> getAllOrders() {
        return radiologyOrderRepository.findAll()
                .stream().map(RadiologyOrderMapper::mapToDto).toList();
    }

    @Override
    public RadiologyOrderDto getOrderById(Long id) {
        return RadiologyOrderMapper.mapToDto(findOrThrow(id));
    }

    @Override
    public List<RadiologyOrderDto> getOrdersByPatient(Long patientId) {
        return radiologyOrderRepository.findByPatient_Id(patientId)
                .stream().map(RadiologyOrderMapper::mapToDto).toList();
    }

    @Override
    public List<RadiologyOrderDto> getOrdersByDoctor(Long doctorId) {
        return radiologyOrderRepository.findByDoctor_Id(doctorId)
                .stream().map(RadiologyOrderMapper::mapToDto).toList();
    }

    @Override
    public List<RadiologyOrderDto> getOrdersByTechnician(Long technicianId) {
        return radiologyOrderRepository.findByTechnician_Id(technicianId)
                .stream().map(RadiologyOrderMapper::mapToDto).toList();
    }

    @Override
    public List<RadiologyOrderDto> getOrdersByStatus(String status) {
        if (status == null || status.isBlank()) return Collections.emptyList();
        try {
            RadiologyOrderStatus enumStatus =
                    RadiologyOrderStatus.valueOf(status.toUpperCase().trim());
            return radiologyOrderRepository.findByStatus(enumStatus)
                    .stream().map(RadiologyOrderMapper::mapToDto).toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid radiology order status: " + status);
        }
    }
    @Override
    public List<RadiologyOrderDto> getOrdersByType(String orderType) {
        if (orderType == null || orderType.isBlank()) return Collections.emptyList();
        try {
            RadiologyOrderType enumType =
                    RadiologyOrderType.valueOf(orderType.toUpperCase().trim());
            return radiologyOrderRepository.findByOrderType(enumType)
                    .stream().map(RadiologyOrderMapper::mapToDto).toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid radiology order type: " + orderType);
        }
    }
    @Override
    public List<RadiologyOrderDto> getCriticalOrders() {
        return radiologyOrderRepository.findByIsCriticalTrue()
                .stream().map(RadiologyOrderMapper::mapToDto).toList();
    }

    @Override
    public List<RadiologyOrderDto> getOrdersByPatientAndStatus(Long patientId, String status) {
        try {
            RadiologyOrderStatus enumStatus =
                    RadiologyOrderStatus.valueOf(status.toUpperCase().trim());
            return radiologyOrderRepository.findByPatient_IdAndStatus(patientId, enumStatus)
                    .stream().map(RadiologyOrderMapper::mapToDto).toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid radiology order status: " + status);
        }
    }
    @Override
    public RadiologyOrderDto createOrder(RadiologyOrderDto dto) {
        // Resolve Patient
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new UserNotFoundException(
                        "Patient not found with id: " + dto.getPatientId()));

        // Resolve Doctor
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new UserNotFoundException(
                        "Doctor not found with id: " + dto.getDoctorId()));

        // Guard: patient must have an open invoice before any operation
        invoiceService.requireOpenInvoice(patient.getId());

        RadiologyOrder order = RadiologyOrderMapper.mapToEntity(dto);
        order.setPatient(patient);
        order.setPatientName(patient.getName());
        order.setDoctor(doctor);
        order.setDoctorName(doctor.getName());

        // Optional: assign technician at creation
        if (dto.getTechnicianId() != null) {
            Technician tech = technicianRepository.findById(dto.getTechnicianId())
                    .orElseThrow(() -> new UserNotFoundException(
                            "Technician not found with id: " + dto.getTechnicianId()));
            order.setTechnician(tech);
            order.setTechnicianName(tech.getName());
        }

        order.setStatus(RadiologyOrderStatus.ORDERED);
        order.setOrderedAt(LocalDateTime.now());
        order.setCreatedAt(LocalDateTime.now());

        RadiologyOrder saved = radiologyOrderRepository.save(order);

        // Notify patient
        notify(patient.getId(),
                "Radiology Order Created",
                "Dr. " + doctor.getName() + " has requested a " + dto.getOrderType() + " scan for you.",
                NotificationType.RADIOLOGY_ORDER_CREATED,
                "/patient/history");

        // Notify technicians if available
        try {
            technicianRepository.findAll().forEach(tech ->
                notify(tech.getId(),
                        "New Radiology Order",
                        "A new " + dto.getOrderType() + " scan order has been submitted for patient " + patient.getName() + ".",
                        NotificationType.RADIOLOGY_ORDER_CREATED,
                        "/technician/requests"));
        } catch (Exception e) {
            log.warn("Could not notify technicians about radiology order: {}", e.getMessage());
        }

        return RadiologyOrderMapper.mapToDto(saved);
    }

    @Override
    public RadiologyOrderDto updateOrder(Long id, RadiologyOrderDto dto) {
        RadiologyOrder existing = findOrThrow(id);

        if (dto.getBodyPart() != null)            existing.setBodyPart(dto.getBodyPart());
        if (dto.getClinicalIndication() != null)  existing.setClinicalIndication(dto.getClinicalIndication());
        if (dto.getContrast() != null)            existing.setContrast(dto.getContrast());
        if (dto.getSpecialInstructions() != null) existing.setSpecialInstructions(dto.getSpecialInstructions());
        if (dto.getNotes() != null)               existing.setNotes(dto.getNotes());
        if (dto.getImageUrl() != null)            existing.setImageUrl(dto.getImageUrl());
        if (dto.getIsCritical() != null)          existing.setIsCritical(dto.getIsCritical());

        if (dto.getOrderType() != null && !dto.getOrderType().isBlank()) {
            existing.setOrderType(
                    RadiologyOrderType.valueOf(dto.getOrderType().toUpperCase().trim()));
        }

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            RadiologyOrderStatus newStatus =
                    RadiologyOrderStatus.valueOf(dto.getStatus().toUpperCase().trim());
            existing.setStatus(newStatus);
            // Auto-set timestamps on transition
            if (newStatus == RadiologyOrderStatus.SCHEDULED && existing.getScheduledAt() == null)
                existing.setScheduledAt(LocalDateTime.now());
            if (newStatus == RadiologyOrderStatus.COMPLETED && existing.getCompletedAt() == null)
                existing.setCompletedAt(LocalDateTime.now());
        }

        // Reassign technician
        if (dto.getTechnicianId() != null) {
            Technician tech = technicianRepository.findById(dto.getTechnicianId())
                    .orElseThrow(() -> new UserNotFoundException(
                            "Technician not found with id: " + dto.getTechnicianId()));
            existing.setTechnician(tech);
            existing.setTechnicianName(tech.getName());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return RadiologyOrderMapper.mapToDto(radiologyOrderRepository.save(existing));
    }

    @Override
    public RadiologyOrderDto assignTechnician(Long orderId, Long technicianId) {
        RadiologyOrder order = findOrThrow(orderId);

        Technician tech = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new UserNotFoundException(
                        "Technician not found with id: " + technicianId));

        order.setTechnician(tech);
        order.setTechnicianName(tech.getName());

        if (order.getStatus() == RadiologyOrderStatus.ORDERED ||
                order.getStatus() == RadiologyOrderStatus.SCHEDULED) {
            order.setStatus(RadiologyOrderStatus.IN_PROGRESS);
        }
        order.setUpdatedAt(LocalDateTime.now());
        RadiologyOrder saved = radiologyOrderRepository.save(order);

        notify(tech.getId(), "Radiology Order Assigned",
                "You have been assigned a " + order.getOrderType() + " scan for patient " + order.getPatientName() + ".",
                NotificationType.RADIOLOGY_ORDER_CREATED, "/technician/requests");

        notify(order.getDoctor().getId(), "Radiology Order Assigned",
                "The " + order.getOrderType() + " scan for patient " + order.getPatientName() + " has been assigned to a technician.",
                NotificationType.RADIOLOGY_ORDER_CREATED, "/doctor/tests");

        return RadiologyOrderMapper.mapToDto(saved);
    }

    @Override
    public RadiologyOrderDto scheduleOrder(Long orderId, String scheduledAt) {
        RadiologyOrder order = findOrThrow(orderId);

        if (scheduledAt == null || scheduledAt.isBlank())
            throw new RuntimeException("scheduledAt cannot be empty");

        LocalDateTime scheduledDateTime;
        try {
            scheduledDateTime = LocalDateTime.parse(scheduledAt.trim(), DT_FORMAT);
        } catch (DateTimeParseException e) {
            try {
                scheduledDateTime = LocalDateTime.parse(scheduledAt.trim() + " 00:00", DT_FORMAT);
            } catch (DateTimeParseException ex) {
                throw new RuntimeException(
                        "Cannot parse scheduledAt: '" + scheduledAt + "'. Use yyyy-MM-dd HH:mm");
            }
        }

        order.setScheduledAt(scheduledDateTime);
        order.setStatus(RadiologyOrderStatus.SCHEDULED);
        order.setUpdatedAt(LocalDateTime.now());
        RadiologyOrder saved = radiologyOrderRepository.save(order);

        notify(order.getPatient().getId(), "Radiology Scan Scheduled",
                "Your " + order.getOrderType() + " scan has been scheduled for " + scheduledAt + ".",
                NotificationType.RADIOLOGY_ORDER_CREATED, "/patient/history");

        notify(order.getDoctor().getId(), "Radiology Scan Scheduled",
                "The " + order.getOrderType() + " scan for patient " + order.getPatientName()
                        + " has been scheduled for " + scheduledAt + ".",
                NotificationType.RADIOLOGY_ORDER_CREATED, "/doctor/tests");

        return RadiologyOrderMapper.mapToDto(saved);
    }

    @Override
    public RadiologyOrderDto enterReport(Long orderId, String reportFindings,
                                         String impression, String imageUrl,
                                         Boolean isCritical, String notes) {
        RadiologyOrder order = findOrThrow(orderId);

        if (reportFindings == null || reportFindings.isBlank())
            throw new RuntimeException("Report findings cannot be empty");

        order.setReportFindings(reportFindings);
        if (impression != null)  order.setImpression(impression);
        if (imageUrl != null)    order.setImageUrl(imageUrl);
        if (notes != null)       order.setNotes(notes);
        order.setIsCritical(isCritical != null && isCritical);
        order.setStatus(RadiologyOrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        RadiologyOrder saved = radiologyOrderRepository.save(order);

        // Auto-add radiology charge to patient invoice
        if (saved.getPatient() != null) {
            try {
                double charge = switch (saved.getOrderType()) {
                    case MRI          -> 500.0;
                    case CT_SCAN      -> 400.0;
                    case ECHOCARDIOGRAM, PET_SCAN -> 350.0;
                    case MAMMOGRAPHY, BONE_SCAN   -> 300.0;
                    case ULTRASOUND   -> 150.0;
                    case XRAY         -> 100.0;
                    default           -> 200.0;
                };
                invoiceService.addTestCharge(
                        saved.getPatient().getId(), saved.getId(),
                        saved.getOrderType().toString(), charge);
            } catch (Exception e) {
                log.warn("Could not add radiology charge to invoice for order {}: {}",
                        orderId, e.getMessage());
            }
        }

        // Notify patient and doctor of completed radiology
        notify(order.getPatient().getId(),
                "Radiology Results Ready",
                "Your " + order.getOrderType() + " scan report is now available.",
                NotificationType.RADIOLOGY_ORDER_COMPLETED,
                "/patient/history");

        notify(order.getDoctor().getId(),
                "Radiology Report Ready",
                "The " + order.getOrderType() + " scan for patient " + order.getPatientName() + " is complete.",
                NotificationType.RADIOLOGY_ORDER_COMPLETED,
                "/doctor/tests");

        return RadiologyOrderMapper.mapToDto(saved);
    }
    @Override
    public void deleteOrder(Long id) {
        radiologyOrderRepository.delete(findOrThrow(id));
    }

    private RadiologyOrder findOrThrow(Long id) {
        return radiologyOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "RadiologyOrder not found with id: " + id));
    }
}
