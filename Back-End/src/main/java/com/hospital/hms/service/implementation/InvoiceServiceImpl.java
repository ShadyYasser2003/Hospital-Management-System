package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.InvoiceItemType;
import com.hospital.hms.Enum.InvoiceStatus;
import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.Enum.PaymentMethod;
import com.hospital.hms.dto.InvoiceDTO;
import com.hospital.hms.dto.InvoiceItemDTO;
import com.hospital.hms.dto.PaymentDTO;
import com.hospital.hms.entity.*;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.InvoiceMapper;
import com.hospital.hms.mapper.PaymentMapper;
import com.hospital.hms.repository.*;
import com.hospital.hms.service.InvoiceService;
import com.hospital.hms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository    invoiceRepository;
    private final PaymentRepository    paymentRepository;
    private final PatientRepository    patientRepository;
    private final AccountantRepository accountantRepository;
    private final AdminRepository      adminRepository;
    private final NotificationService  notificationService;

    private String generateInvoiceNumber() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        return "INV-" + ts + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    /** Silently notify a single recipient — never throws */
    private void notify(Long recipientId, String title, String message,
                        NotificationType type, String url) {
        try { notificationService.sendNotification(recipientId, title, message, type, url); }
        catch (Exception e) { log.warn("Notification skipped for user {}: {}", recipientId, e.getMessage()); }
    }

    /** Broadcast a notification to every accountant in the system */
    private void notifyAllAccountants(String title, String message,
                                      NotificationType type, String url) {
        try {
            accountantRepository.findAll().forEach(a -> notify(a.getId(), title, message, type, url));
        } catch (Exception e) {
            log.warn("Accountant broadcast skipped: {}", e.getMessage());
        }
    }

    /** Broadcast a notification to every admin in the system */
    private void notifyAllAdmins(String title, String message,
                                  NotificationType type, String url) {
        try {
            adminRepository.findAll().forEach(a -> notify(a.getId(), title, message, type, url));
        } catch (Exception e) {
            log.warn("Admin broadcast skipped: {}", e.getMessage());
        }
    }

    private Invoice getEntity(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

    @Override
    @Transactional
    public InvoiceDTO createInvoice(Long patientId, Long accountantId, String notes) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new UserNotFoundException("Patient not found: " + patientId));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .status(InvoiceStatus.PENDING)
                .totalAmount(0.0).paidAmount(0.0)
                .notes(notes).patient(patient)
                .createdAt(LocalDateTime.now())
                .build();

        if (accountantId != null)
            accountantRepository.findById(accountantId).ifPresent(invoice::setAccountant);

        Invoice saved = invoiceRepository.save(invoice);

        try {
            notificationService.sendNotification(patient.getId(),
                    "Invoice Created",
                    "Invoice " + saved.getInvoiceNumber() + " has been created for you.",
                    NotificationType.INVOICE_CREATED,
                    "/patient/billing/" + saved.getId());
        } catch (Exception e) { log.warn("Invoice notification skipped: {}", e.getMessage()); }

        notifyAllAccountants(
                "New Invoice Created",
                "Invoice " + saved.getInvoiceNumber() + " created for patient " + patient.getName() + ".",
                NotificationType.INVOICE_CREATED,
                "/accountant/invoices");

        return InvoiceMapper.mapToDto(saved);
    }

    @Override @Transactional(readOnly = true)
    public InvoiceDTO getById(Long id) { return InvoiceMapper.mapToDto(getEntity(id)); }

    @Override @Transactional(readOnly = true)
    public InvoiceDTO getByInvoiceNumber(String number) {
        return InvoiceMapper.mapToDto(
                invoiceRepository.findByInvoiceNumber(number)
                        .orElseThrow(() -> new RuntimeException("Invoice not found: " + number)));
    }

    @Override @Transactional(readOnly = true)
    public Page<InvoiceDTO> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(InvoiceMapper::mapToDto);
    }

    @Override @Transactional(readOnly = true)
    public List<InvoiceDTO> getByPatient(Long patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .map(InvoiceMapper::mapToDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<InvoiceDTO> getByStatus(String status) {
        return invoiceRepository.findByStatus(InvoiceStatus.valueOf(status.toUpperCase()))
                .stream().map(InvoiceMapper::mapToDto).collect(Collectors.toList());
    }

    @Override @Transactional
    public InvoiceDTO addItem(Long invoiceId, InvoiceItemDTO itemDto) {
        Invoice invoice = getEntity(invoiceId);
        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.CANCELLED)
            throw new RuntimeException("Cannot add items to a " + invoice.getStatus() + " invoice");

        InvoiceItemType type;
        try { type = InvoiceItemType.valueOf(itemDto.getItemType().toUpperCase()); }
        catch (Exception e) { type = InvoiceItemType.OTHER; }

        InvoiceItem item = InvoiceItem.builder()
                .description(itemDto.getDescription()).itemType(type)
                .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1)
                .unitPrice(itemDto.getUnitPrice())
                .referenceId(itemDto.getReferenceId())
                .invoice(invoice).build();
        item.calculateTotal();

        invoice.getItems().add(item);
        invoice.recalculateTotal();
        return InvoiceMapper.mapToDto(invoiceRepository.save(invoice));
    }

    @Override @Transactional
    public InvoiceDTO removeItem(Long invoiceId, Long itemId) {
        Invoice invoice = getEntity(invoiceId);
        invoice.getItems().removeIf(i -> i.getId().equals(itemId));
        invoice.recalculateTotal();
        return InvoiceMapper.mapToDto(invoiceRepository.save(invoice));
    }

    @Override @Transactional
    public PaymentDTO recordPayment(Long invoiceId, PaymentDTO paymentDto) {
        Invoice invoice = getEntity(invoiceId);
        if (invoice.getStatus() == InvoiceStatus.CANCELLED)
            throw new RuntimeException("Cannot record payment for a cancelled invoice");
        if (invoice.getStatus() == InvoiceStatus.PAID)
            throw new RuntimeException("Invoice is already fully paid");

        PaymentMethod method;
        try { method = PaymentMethod.valueOf(paymentDto.getPaymentMethod().toUpperCase()); }
        catch (Exception e) { method = PaymentMethod.CASH; }

        Payment payment = Payment.builder()
                .amount(paymentDto.getAmount()).paymentMethod(method)
                .notes(paymentDto.getNotes()).referenceNumber(paymentDto.getReferenceNumber())
                .paidAt(LocalDateTime.now()).invoice(invoice).patient(invoice.getPatient())
                .build();

        Payment saved = paymentRepository.save(payment);
        invoice.getPayments().add(saved);
        invoice.recalculatePaidAmount();
        invoiceRepository.save(invoice);

        try {
            notificationService.sendNotification(invoice.getPatient().getId(),
                    "Payment Received",
                    "Payment of " + paymentDto.getAmount() + " received for invoice " + invoice.getInvoiceNumber(),
                    NotificationType.PAYMENT_RECEIVED,
                    "/patient/billing/" + invoice.getId());
        } catch (Exception e) { log.warn("Payment notification skipped: {}", e.getMessage()); }

        notifyAllAccountants(
                "Payment Received",
                "Payment of $" + String.format("%.2f", paymentDto.getAmount())
                        + " received for invoice " + invoice.getInvoiceNumber()
                        + " (patient: " + invoice.getPatient().getName() + ").",
                NotificationType.PAYMENT_RECEIVED,
                "/accountant/invoices");

        notifyAllAdmins(
                "Payment Received",
                "Payment of $" + String.format("%.2f", paymentDto.getAmount())
                        + " received for invoice " + invoice.getInvoiceNumber()
                        + " — patient: " + invoice.getPatient().getName() + ".",
                NotificationType.PAYMENT_RECEIVED,
                "/admin/transactions");

        return PaymentMapper.mapToDto(saved);
    }

    @Override @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(PaymentMapper::mapToDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByPatient(Long patientId) {
        return paymentRepository.findByPatientId(patientId).stream()
                .map(PaymentMapper::mapToDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(PaymentMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    public InvoiceDTO cancelInvoice(Long invoiceId) {
        Invoice invoice = getEntity(invoiceId);
        invoice.setStatus(InvoiceStatus.CANCELLED);
        Invoice saved = invoiceRepository.save(invoice);

        notify(saved.getPatient().getId(),
                "Invoice Cancelled",
                "Invoice " + saved.getInvoiceNumber() + " has been cancelled.",
                NotificationType.INVOICE_CREATED,
                "/patient/billing/" + saved.getId());

        notifyAllAccountants("Invoice Cancelled",
                "Invoice " + saved.getInvoiceNumber()
                        + " for patient " + saved.getPatient().getName() + " has been cancelled.",
                NotificationType.INVOICE_CREATED, "/accountant/invoices");

        return InvoiceMapper.mapToDto(saved);
    }

    @Override @Transactional(propagation = Propagation.REQUIRES_NEW)
    public InvoiceDTO addMedicationCharge(Long patientId, Long prescriptionId,
                                          String description, Double amount) {
        Invoice invoice = getOrCreateOpen(patientId);
        InvoiceItem item = InvoiceItem.builder()
                .description(description).itemType(InvoiceItemType.MEDICATION)
                .quantity(1).unitPrice(amount).total(amount)
                .referenceId(prescriptionId).invoice(invoice).build();
        invoice.getItems().add(item);
        invoice.recalculateTotal();
        InvoiceDTO result = InvoiceMapper.mapToDto(invoiceRepository.save(invoice));

        notify(patientId, "Medication Charge Added",
                "A medication charge of $" + String.format("%.2f", amount) + " has been added to your invoice.",
                NotificationType.CHARGE_ADDED, "/patient/billing/" + invoice.getId());

        notifyAllAccountants("Medication Charge Added",
                "Medication charge $" + String.format("%.2f", amount)
                        + " added to invoice " + invoice.getInvoiceNumber()
                        + " for patient " + invoice.getPatient().getName() + ".",
                NotificationType.CHARGE_ADDED, "/accountant/invoices");

        return result;
    }

    @Override @Transactional(propagation = Propagation.REQUIRES_NEW)
    public InvoiceDTO addTestCharge(Long patientId, Long testRequestId,
                                    String testType, Double amount) {
        Invoice invoice = getOrCreateOpen(patientId);
        InvoiceItemType itemType = (testType != null &&
                (testType.contains("X_RAY") || testType.contains("MRI") || testType.contains("CT")))
                ? InvoiceItemType.IMAGING : InvoiceItemType.LAB_TEST;

        InvoiceItem item = InvoiceItem.builder()
                .description(testType + " Test").itemType(itemType)
                .quantity(1).unitPrice(amount).total(amount)
                .referenceId(testRequestId).invoice(invoice).build();
        invoice.getItems().add(item);
        invoice.recalculateTotal();
        InvoiceDTO result = InvoiceMapper.mapToDto(invoiceRepository.save(invoice));

        notify(patientId, "Test Charge Added",
                "A " + testType + " test charge of $" + String.format("%.2f", amount) + " has been added to your invoice.",
                NotificationType.CHARGE_ADDED, "/patient/billing/" + invoice.getId());

        notifyAllAccountants("Test Charge Added",
                testType + " test charge $" + String.format("%.2f", amount)
                        + " added to invoice " + invoice.getInvoiceNumber()
                        + " for patient " + invoice.getPatient().getName() + ".",
                NotificationType.CHARGE_ADDED, "/accountant/invoices");

        return result;
    }

    @Override @Transactional(readOnly = true)
    public void requireOpenInvoice(Long patientId) {
        boolean hasOpen = invoiceRepository.findByPatientId(patientId).stream()
                .anyMatch(inv -> inv.getStatus() == InvoiceStatus.PENDING
                              || inv.getStatus() == InvoiceStatus.PARTIAL);
        if (!hasOpen)
            throw new RuntimeException(
                "No open invoice found for patient " + patientId +
                ". Please create an invoice first before proceeding.");
    }

    private Invoice getOrCreateOpen(Long patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .filter(inv -> inv.getStatus() == InvoiceStatus.PENDING
                            || inv.getStatus() == InvoiceStatus.PARTIAL)
                .findFirst()
                .orElseGet(() -> {
                    Patient patient = patientRepository.findById(patientId)
                            .orElseThrow(() -> new UserNotFoundException("Patient not found: " + patientId));
                    return invoiceRepository.save(Invoice.builder()
                            .invoiceNumber(generateInvoiceNumber())
                            .status(InvoiceStatus.PENDING)
                            .totalAmount(0.0).paidAmount(0.0)
                            .patient(patient).createdAt(LocalDateTime.now()).build());
                });
    }

    @Override @Transactional(propagation = Propagation.REQUIRES_NEW)
    public InvoiceDTO addConsultationCharge(Long patientId, Long appointmentId,
                                            String description, Double amount) {
        Invoice invoice = getOrCreateOpen(patientId);
        InvoiceItem item = InvoiceItem.builder()
                .description(description)
                .itemType(InvoiceItemType.CONSULTATION)
                .quantity(1)
                .unitPrice(amount)
                .total(amount)
                .referenceId(appointmentId)
                .invoice(invoice)
                .build();
        invoice.getItems().add(item);
        invoice.recalculateTotal();
        InvoiceDTO result = InvoiceMapper.mapToDto(invoiceRepository.save(invoice));

        notify(patientId, "Consultation Charge Added",
                "A consultation fee of $" + String.format("%.2f", amount) + " has been added to your invoice.",
                NotificationType.CHARGE_ADDED, "/patient/billing/" + invoice.getId());

        notifyAllAccountants("Consultation Charge Added",
                "Consultation fee $" + String.format("%.2f", amount)
                        + " added to invoice " + invoice.getInvoiceNumber()
                        + " for patient " + invoice.getPatient().getName() + ".",
                NotificationType.CHARGE_ADDED, "/accountant/invoices");

        return result;
    }

    private static final double BED_CHARGE_PER_DAY = 20.0;

    @Override @Transactional(propagation = Propagation.REQUIRES_NEW)
    public InvoiceDTO addBedCharge(Long patientId, int days, Double chargePerDay,
                                   String admissionDate, String dischargeDate) {
        Invoice invoice = getOrCreateOpen(patientId);
        double rate  = BED_CHARGE_PER_DAY;   // always use system-defined rate
        double total = days * rate;
        String desc = "Bed Charge: " + days + " day(s) @ $" + String.format("%.0f", rate) + "/day"
                + (admissionDate != null ? " (" + admissionDate + " → " + dischargeDate + ")" : "");
        InvoiceItem item = InvoiceItem.builder()
                .description(desc)
                .itemType(InvoiceItemType.BED_CHARGE)
                .quantity(days)
                .unitPrice(rate)
                .total(total)
                .invoice(invoice)
                .build();
        invoice.getItems().add(item);
        invoice.recalculateTotal();

        InvoiceDTO result = InvoiceMapper.mapToDto(invoiceRepository.save(invoice));

        try {
            notificationService.sendNotification(
                    invoice.getPatient().getId(),
                    "Bed Charge Added",
                    "A bed charge of $" + String.format("%.2f", total)
                            + " (" + days + " day(s)) has been added to your invoice.",
                    NotificationType.CHARGE_ADDED,
                    "/patient/billing/" + invoice.getId());
        } catch (Exception e) { log.warn("Bed charge notification skipped: {}", e.getMessage()); }

        notifyAllAccountants("Bed Charge Added",
                "Bed charge $" + String.format("%.2f", total) + " (" + days + " day(s))"
                        + " added to invoice " + result.getInvoiceNumber()
                        + " for patient " + invoice.getPatient().getName() + ".",
                NotificationType.CHARGE_ADDED, "/accountant/invoices");

        return result;
    }
}
