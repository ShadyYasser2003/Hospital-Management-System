package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.*;
import com.hospital.hms.dto.BloodRequestDto;
import com.hospital.hms.dto.BloodUnitDto;
import com.hospital.hms.entity.BloodRequest;
import com.hospital.hms.entity.BloodUnit;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.BloodRequestMapper;
import com.hospital.hms.mapper.BloodUnitMapper;
import com.hospital.hms.repository.BloodRequestRepository;
import com.hospital.hms.repository.BloodUnitRepository;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.service.BloodBankService;
import com.hospital.hms.service.EmailService;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * BloodBankServiceImpl
 *
 * ──────────────────────────────────────────────────────────────────────────
 * AUTO-RESERVE FLOW (requestBlood)
 * ──────────────────────────────────────────────────────────────────────────
 *  1. Validate input (quantity > 0, valid blood type, patient + doctor exist).
 *  2. Acquire PESSIMISTIC_WRITE lock on all AVAILABLE non-expired units of the
 *     requested blood type (prevents race conditions under concurrent requests).
 *  3. Walk the list in expiry-ascending order, consuming units greedily until
 *     the requested quantity is satisfied:
 *       - If a unit has MORE than needed: reduce its quantity, leave AVAILABLE.
 *       - If a unit has EXACTLY what's needed: set quantity=0, mark RESERVED.
 *       - If a unit has LESS than needed: fully exhaust it (quantity=0, RESERVED),
 *         continue to the next unit.
 *  4. If total available >= requested → set request status = RESERVED;
 *     send "auto-reserved" email notification.
 *     If total available < requested  → set request status = PENDING;
 *     release any partial reservations (rollback is handled by @Transactional);
 *     send "insufficient stock" notification email.
 *  5. Check low-stock threshold; send alert if total drops below LOW_STOCK_THRESHOLD.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * FULFILL FLOW (fulfillRequest)
 * ──────────────────────────────────────────────────────────────────────────
 *  - Allowed only when status == RESERVED.
 *  - The units that were RESERVED for this request are identified by blood type
 *    and marked USED (quantity already 0 from the reservation step).
 *  - Request status → COMPLETED; fulfilledAt = now().
 *
 * ──────────────────────────────────────────────────────────────────────────
 * CANCEL FLOW (cancelRequest)
 * ──────────────────────────────────────────────────────────────────────────
 *  - Allowed for PENDING or RESERVED requests.
 *  - If RESERVED: restore the reserved units back to AVAILABLE with their
 *    original quantity so they can serve other requests.
 *  - Request status → CANCELLED.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * RACE-CONDITION SAFETY
 * ──────────────────────────────────────────────────────────────────────────
 *  - @Transactional ensures atomicity: either all unit updates + request save
 *    succeed, or nothing is persisted.
 *  - PESSIMISTIC_WRITE on BloodUnit rows prevents two concurrent calls from
 *    reserving the same physical units.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BloodBankServiceImpl implements BloodBankService {

    /** Units below this per blood type trigger a low-stock alert email. */
    private static final int LOW_STOCK_THRESHOLD = 5;

    private final BloodUnitRepository    bloodUnitRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final PatientRepository      patientRepository;
    private final DoctorRepository       doctorRepository;
    private final EmailService           emailService;
    private final NotificationService    notificationService;
    private final InvoiceService         invoiceService;

    @Value("${hospital.name:Our Hospital}")
    private String hospitalName;

    @Value("${hospital.blood-bank-email:bloodbank@example.com}")
    private String bloodBankEmail;

    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Blood bank notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }

    // ══════════════════════════════════════════════════════════════════════
    // Blood Unit management
    // ══════════════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<BloodUnitDto> getAllBloodUnits() {
        return bloodUnitRepository.findAll()
                .stream()
                .map(BloodUnitMapper::mapToDto)
                .toList();
    }

    @Override
    @Transactional
    public BloodUnitDto addBloodUnit(BloodUnitDto dto) {
        if (dto.getQuantity() == null || dto.getQuantity() <= 0)
            throw new RuntimeException("Quantity must be greater than 0");

        BloodUnit unit = BloodUnitMapper.mapToEntity(dto);   // validates blood type
        unit.setStatus(BloodUnitStatus.AVAILABLE);
        unit.setCreatedAt(LocalDateTime.now());

        BloodUnit saved = bloodUnitRepository.save(unit);
        log.info("Added blood unit id={} type={} qty={}",
                saved.getId(), saved.getBloodType(), saved.getQuantity());

        return BloodUnitMapper.mapToDto(saved);
    }

    @Override
    @Transactional
    public BloodUnitDto updateBloodUnit(Long id, BloodUnitDto dto) {
        BloodUnit existing = findUnitOrThrow(id);

        if (dto.getQuantity() != null) {
            if (dto.getQuantity() < 0)
                throw new RuntimeException("Quantity cannot be negative");
            existing.setQuantity(dto.getQuantity());
        }
        if (dto.getExpiryDate() != null)
            existing.setExpiryDate(LocalDate.parse(dto.getExpiryDate()));
        if (dto.getNotes() != null)
            existing.setNotes(dto.getNotes());
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            try {
                existing.setStatus(
                        BloodUnitStatus.valueOf(dto.getStatus().toUpperCase().trim()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid blood unit status: " + dto.getStatus());
            }
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return BloodUnitMapper.mapToDto(bloodUnitRepository.save(existing));
    }

    // ══════════════════════════════════════════════════════════════════════
    // Blood Request queries
    // ══════════════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<BloodRequestDto> getAllRequests() {
        return bloodRequestRepository.findAll()
                .stream()
                .map(BloodRequestMapper::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BloodRequestDto> getRequestsByPatient(Long patientId) {
        return bloodRequestRepository.findByPatient_Id(patientId)
                .stream()
                .map(BloodRequestMapper::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BloodRequestDto> getPendingRequests() {
        return bloodRequestRepository.findByStatus(BloodRequestStatus.PENDING)
                .stream()
                .map(BloodRequestMapper::mapToDto)
                .toList();
    }

    // ══════════════════════════════════════════════════════════════════════
    // requestBlood — core auto-reserve logic
    // ══════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public BloodRequestDto requestBlood(BloodRequestDto dto) {

        // ── 1. Validate & resolve entities ──────────────────────────────
        if (dto.getPatientId() == null)
            throw new RuntimeException("patientId is required");
        if (dto.getRequestedById() == null)
            throw new RuntimeException("requestedById (doctor) is required");
        if (dto.getQuantity() == null || dto.getQuantity() <= 0)
            throw new RuntimeException("Quantity must be greater than 0");

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new UserNotFoundException(
                        "Patient not found with id: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getRequestedById())
                .orElseThrow(() -> new UserNotFoundException(
                        "Doctor not found with id: " + dto.getRequestedById()));

        // Guard: patient must have an open invoice before any operation
        invoiceService.requireOpenInvoice(patient.getId());

        BloodType bloodType = BloodUnitMapper.parseBloodType(dto.getBloodType());

        BloodRequestUrgency urgency = dto.getUrgency() != null
                ? parseUrgency(dto.getUrgency())
                : BloodRequestUrgency.MEDIUM;

        // ── 2. Build the request entity (not yet saved) ─────────────────
        BloodRequest request = BloodRequest.builder()
                .patient(patient)
                .patientName(patient.getName())
                .requestedBy(doctor)
                .requestedByName(doctor.getName())
                .bloodType(bloodType)
                .quantity(dto.getQuantity())
                .urgency(urgency)
                .notes(dto.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        // ── 3. Attempt auto-reserve (PESSIMISTIC_WRITE lock inside repo) ─
        List<BloodUnit> availableUnits = bloodUnitRepository
                .findAvailableUnits(bloodType, LocalDate.now());

        int needed  = dto.getQuantity();
        int totalAvailable = availableUnits.stream()
                .mapToInt(BloodUnit::getQuantity).sum();

        if (totalAvailable >= needed) {

            // Enough stock — reserve greedily from oldest-expiry units first
            List<BloodUnit> modified = new ArrayList<>();
            int remaining = needed;

            for (BloodUnit unit : availableUnits) {
                if (remaining <= 0) break;

                int take = Math.min(unit.getQuantity(), remaining);
                remaining -= take;

                if (unit.getQuantity() - take == 0) {
                    // Fully consumed: mark RESERVED, quantity → 0
                    unit.setQuantity(0);
                    unit.setStatus(BloodUnitStatus.RESERVED);
                } else {
                    // Partially consumed: reduce quantity, stays AVAILABLE
                    unit.setQuantity(unit.getQuantity() - take);
                }
                unit.setUpdatedAt(LocalDateTime.now());
                modified.add(unit);
            }

            bloodUnitRepository.saveAll(modified);
            request.setStatus(BloodRequestStatus.RESERVED);
            log.info("Blood request auto-reserved: patient={} type={} qty={}",
                    patient.getName(), bloodType, needed);

            // Notify blood bank that units have been auto-reserved
            sendEmailSilently(() ->
                    emailService.sendBloodReservedEmail(
                            bloodBankEmail,
                            patient.getName(),
                            bloodType.name(),
                            needed,
                            urgency.name(),
                            doctor.getName()));

            // ── 4. Low-stock alert ────────────────────────────────────────
            int stockAfter = bloodUnitRepository
                    .sumAvailableQuantity(bloodType, LocalDate.now());
            if (stockAfter < LOW_STOCK_THRESHOLD) {
                log.warn("LOW STOCK ALERT: {} has only {} units remaining",
                        bloodType, stockAfter);
                sendEmailSilently(() ->
                        emailService.sendLowStockAlertEmail(
                                bloodBankEmail,
                                bloodType.name(),
                                stockAfter));
            }

        } else {

            // Not enough stock — leave PENDING, notify blood bank
            request.setStatus(BloodRequestStatus.PENDING);
            log.warn("Insufficient blood stock: requested {} of {} but only {} available",
                    needed, bloodType, totalAvailable);

            sendEmailSilently(() ->
                    emailService.sendBloodRequestEmail(
                            bloodBankEmail,
                            patient.getName(),
                            bloodType.name(),
                            needed,
                            urgency.name(),
                            doctor.getName()));
        }

        BloodRequest saved = bloodRequestRepository.save(request);

        // ── Notify doctor ────────────────────────────────────────────────
        notify(doctor.getId(),
                "Blood Request Created",
                "Your blood request for patient " + patient.getName() +
                " (" + bloodType.name() + ", " + dto.getQuantity() + " units) has been submitted.",
                NotificationType.BLOOD_REQUEST_CREATED,
                "/doctor/blood-bank");

        // ── Notify patient ────────────────────────────────────────────────
        if (saved.getStatus() == BloodRequestStatus.RESERVED) {
            notify(patient.getId(),
                    "Blood Units Reserved",
                    "Blood units (" + bloodType.name() + " × " + dto.getQuantity() +
                    ") have been reserved for you. Please contact the blood bank.",
                    NotificationType.BLOOD_REQUEST_RESERVED,
                    "/patient/history");

            notify(doctor.getId(),
                    "Blood Units Reserved",
                    "Blood units (" + bloodType.name() + " × " + dto.getQuantity() +
                    ") for patient " + patient.getName() + " have been automatically reserved.",
                    NotificationType.BLOOD_REQUEST_RESERVED,
                    "/doctor/blood-bank");
        } else {
            // PENDING — insufficient stock
            notify(patient.getId(),
                    "Blood Request Submitted",
                    "A blood request (" + bloodType.name() + " × " + dto.getQuantity() +
                    ") has been submitted for you. The blood bank will process it shortly.",
                    NotificationType.BLOOD_REQUEST_CREATED,
                    "/patient/history");
        }

        return BloodRequestMapper.mapToDto(saved);
    }

    // ══════════════════════════════════════════════════════════════════════
    // fulfillRequest — RESERVED → COMPLETED
    // ══════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public BloodRequestDto fulfillRequest(Long requestId) {
        BloodRequest request = findRequestOrThrow(requestId);

        if (request.getStatus() != BloodRequestStatus.RESERVED) {
            String msg = switch (request.getStatus()) {
                case PENDING    -> "Cannot fulfill a PENDING request — units have not been reserved yet. "
                                 + "Wait for stock to be added, then the request will auto-reserve.";
                case COMPLETED  -> "Request is already COMPLETED.";
                case CANCELLED  -> "Cannot fulfill a CANCELLED request.";
                default         -> "Request is in unexpected status: " + request.getStatus();
            };
            throw new RuntimeException(msg);
        }

        // Mark the RESERVED units of this blood type as USED
        // (they were zeroed out during auto-reserve; we just flip their status)
        List<BloodUnit> reservedUnits = bloodUnitRepository
                .findByStatus(BloodUnitStatus.RESERVED)
                .stream()
                .filter(u -> u.getBloodType() == request.getBloodType())
                .toList();

        reservedUnits.forEach(u -> {
            u.setStatus(BloodUnitStatus.USED);
            u.setUpdatedAt(LocalDateTime.now());
        });
        bloodUnitRepository.saveAll(reservedUnits);

        request.setStatus(BloodRequestStatus.COMPLETED);
        request.setFulfilledAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        BloodRequest saved = bloodRequestRepository.save(request);
        log.info("Blood request {} COMPLETED: patient={} type={} qty={}",
                requestId, request.getPatientName(),
                request.getBloodType(), request.getQuantity());

        // Notify requesting doctor
        notify(request.getRequestedBy().getId(),
                "Blood Request Fulfilled",
                "The blood request (" + request.getBloodType().name() + " × " + request.getQuantity() +
                ") for patient " + request.getPatientName() + " has been fulfilled.",
                NotificationType.BLOOD_REQUEST_COMPLETED,
                "/doctor/blood-bank");

        // Notify patient
        notify(request.getPatient().getId(),
                "Blood Transfusion Ready",
                "Your blood units (" + request.getBloodType().name() + " × " + request.getQuantity() +
                ") have been dispensed. Please follow up with your doctor.",
                NotificationType.BLOOD_REQUEST_COMPLETED,
                "/patient/history");

        // Also send email
        sendEmailSilently(() ->
                emailService.sendBloodCompletedEmail(
                        request.getRequestedBy().getEmail(),
                        request.getPatientName(),
                        request.getBloodType().name(),
                        request.getQuantity(),
                        request.getRequestedByName()));

        return BloodRequestMapper.mapToDto(saved);
    }

    // ══════════════════════════════════════════════════════════════════════
    // cancelRequest — PENDING|RESERVED → CANCELLED
    // ══════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public BloodRequestDto cancelRequest(Long requestId) {
        BloodRequest request = findRequestOrThrow(requestId);

        if (request.getStatus() == BloodRequestStatus.COMPLETED)
            throw new RuntimeException(
                    "Cannot cancel a COMPLETED request — blood has already been dispensed.");
        if (request.getStatus() == BloodRequestStatus.CANCELLED)
            throw new RuntimeException("Request is already CANCELLED.");

        // If units were reserved, release them back to AVAILABLE
        if (request.getStatus() == BloodRequestStatus.RESERVED) {
            List<BloodUnit> reservedUnits = bloodUnitRepository
                    .findByStatus(BloodUnitStatus.RESERVED)
                    .stream()
                    .filter(u -> u.getBloodType() == request.getBloodType())
                    .toList();

            reservedUnits.forEach(u -> {
                u.setStatus(BloodUnitStatus.AVAILABLE);
                u.setQuantity(request.getQuantity()); // restore the original reserved qty
                u.setUpdatedAt(LocalDateTime.now());
            });
            bloodUnitRepository.saveAll(reservedUnits);

            log.info("Released {} units of {} back to AVAILABLE after cancelling request {}",
                    request.getQuantity(), request.getBloodType(), requestId);
        }

        request.setStatus(BloodRequestStatus.CANCELLED);
        request.setUpdatedAt(LocalDateTime.now());

        BloodRequest saved = bloodRequestRepository.save(request);

        // Notify doctor
        notify(request.getRequestedBy().getId(),
                "Blood Request Cancelled",
                "Blood request (" + request.getBloodType().name() + " × " + request.getQuantity() +
                ") for patient " + request.getPatientName() + " has been cancelled.",
                NotificationType.BLOOD_REQUEST_CANCELLED,
                "/doctor/blood-bank");

        // Notify patient
        notify(request.getPatient().getId(),
                "Blood Request Cancelled",
                "Your blood request (" + request.getBloodType().name() + " × " + request.getQuantity() +
                ") has been cancelled. Please contact your doctor for more information.",
                NotificationType.BLOOD_REQUEST_CANCELLED,
                "/patient/history");

        return BloodRequestMapper.mapToDto(saved);
    }

    // ══════════════════════════════════════════════════════════════════════
    // Helpers
    // ══════════════════════════════════════════════════════════════════════

    private BloodUnit findUnitOrThrow(Long id) {
        return bloodUnitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Blood unit not found with id: " + id));
    }

    private BloodRequest findRequestOrThrow(Long id) {
        return bloodRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Blood request not found with id: " + id));
    }

    private BloodRequestUrgency parseUrgency(String value) {
        try {
            return BloodRequestUrgency.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid urgency value: " + value
                    + ". Valid values: LOW, MEDIUM, HIGH");
        }
    }

    /**
     * Wraps email sending in a try/catch so that an SMTP failure never
     * rolls back the main transaction. Errors are logged as warnings.
     */
    private void sendEmailSilently(Runnable emailTask) {
        try {
            emailTask.run();
        } catch (Exception e) {
            log.warn("Email notification failed (non-critical): {}", e.getMessage());
        }
    }
}
