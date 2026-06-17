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

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PatientRepository patientRepository;
    private final AccountantRepository accountantRepository;
    private final NotificationService notificationService;

    // ── helpers ──────────────────────────────────────────────────────────────

    private String generateInvoiceNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        return "INV-" + timestamp + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private Invoice getInvoiceEntity(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

    // ── service methods ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public InvoiceDTO createInvoice(Long patientId, Long accountantId, String notes) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new UserNotFoundException("Patient not found: " + patientId));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .status(InvoiceStatus.PENDING)
                .totalAmount(0.0)
                .paidAmount(0.0)
                .notes(notes)
                .patient(patient)
                .createdAt(LocalDateTime.now())
                .build();

        if (accountantId != null) {
            accountantRepository.findById(accountantId).ifPresent(invoice::setAccountant);
        }

        Invoice saved = invoiceRepository.save(invoice);

        // Notify patient — fire-and-forget
        try {
            notificationService.sendNotification(
                    patient.getId(),
                    "Invoice Created",
                    "A new invoice " + saved.getInvoiceNumber() + " has been created for you.",
                    NotificationType.INVOICE_CREATED,
                    "/patient/billing/" + saved.getId()
            );
        } catch (Exception e) {
            log.warn("Could not send invoice notification: {}", e.getMessage());
        }

        log.info("Invoice created: {} for patient: {}", saved.getInvoiceNumber(), patientId);
        return InvoiceMapper.mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getById(Long id) {
        return InvoiceMapper.mapToDto(getInvoiceEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getByInvoiceNumber(String invoiceNumber) {
        return InvoiceMapper.mapToDto(
                invoiceRepository.findByInvoiceNumber(invoiceNumber)
                        .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceNumber)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceDTO> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(InvoiceMapper::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getByPatient(Long patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .map(InvoiceMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getByStatus(String status) {
        InvoiceStatus s = InvoiceStatus.valueOf(status.toUpperCase());
        return invoiceRepository.findByStatus(s).stream()
                .map(InvoiceMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvoiceDTO addItem(Long invoiceId, InvoiceItemDTO itemDto) {
        Invoice invoice = getInvoiceEntity(invoiceId);

        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new RuntimeException("Cannot add items to a " + invoice.getStatus() + " invoice");
        }

        InvoiceItemType itemType;
        try {
            itemType = InvoiceItemType.valueOf(itemDto.getItemType().toUpperCase());
        } catch (Exception e) {
            itemType = InvoiceItemType.OTHER;
        }

        InvoiceItem item = InvoiceItem.builder()
                .description(itemDto.getDescription())
                .itemType(itemType)
                .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1)
                .unitPrice(itemDto.getUnitPrice())
                .referenceId(itemDto.getReferenceId())
                .invoice(invoice)
                .build();
        item.calculateTotal();

        invoice.getItems().add(item);
        invoice.recalculateTotal();

        return InvoiceMapper.mapToDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceDTO removeItem(Long invoiceId, Long itemId) {
        Invoice invoice = getInvoiceEntity(invoiceId);
        invoice.getItems().removeIf(i -> i.getId().equals(itemId));
        invoice.recalculateTotal();
        return InvoiceMapper.mapToDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public PaymentDTO recordPayment(Long invoiceId, PaymentDTO paymentDto) {
        Invoice invoice = getInvoiceEntity(invoiceId);

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new RuntimeException("Cannot record payment for a cancelled invoice");
        }
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new RuntimeException("Invoice is already fully paid");
        }

        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(paymentDto.getPaymentMethod().toUpperCase());
        } catch (Exception e) {
            method = PaymentMethod.CASH;
        }

        Payment payment = Payment.builder()
                .amount(paymentDto.getAmount())
                .paymentMethod(method)
                .notes(paymentDto.getNotes())
                .referenceNumber(paymentDto.getReferenceNumber())
                .paidAt(LocalDateTime.now())
                .invoice(invoice)
                .patient(invoice.getPatient())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        invoice.getPayments().add(savedPayment);
        invoice.recalculatePaidAmount();
        invoiceRepository.save(invoice);

        // Notify patient — fire-and-forget
        try {
            notificationService.sendNotification(
                    invoice.getPatient().getId(),
                    "Payment Received",
                    "Payment of " + paymentDto.getAmount() + " received for invoice " + invoice.getInvoiceNumber(),
                    NotificationType.PAYMENT_RECEIVED,
                    "/patient/billing/" + invoice.getId()
            );
        } catch (Exception e) {
            log.warn("Could not send payment notification: {}", e.getMessage());
        }

        log.info("Payment recorded: {} for invoice: {}", savedPayment.getId(), invoice.getInvoiceNumber());
        return PaymentMapper.mapToDto(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(PaymentMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByPatient(Long patientId) {
        return paymentRepository.findByPatientId(patientId).stream()
                .map(PaymentMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(PaymentMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvoiceDTO cancelInvoice(Long invoiceId) {
        Invoice invoice = getInvoiceEntity(invoiceId);
        invoice.setStatus(InvoiceStatus.CANCELLED);
        return InvoiceMapper.mapToDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public InvoiceDTO addMedicationCharge(Long patientId, Long prescriptionId,
                                          String description, Double amount) {
        Invoice invoice = getOrCreateOpenInvoice(patientId);

        InvoiceItem item = InvoiceItem.builder()
                .description(description)
                .itemType(InvoiceItemType.MEDICATION)
                .quantity(1)
                .unitPrice(amount)
                .total(amount)
                .referenceId(prescriptionId)
                .invoice(invoice)
                .build();

        invoice.getItems().add(item);
        invoice.recalculateTotal();
        return InvoiceMapper.mapToDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public InvoiceDTO addTestCharge(Long patientId, Long testRequestId,
                                    String testType, Double amount) {
        Invoice invoice = getOrCreateOpenInvoice(patientId);

        InvoiceItemType itemType = testType != null &&
                (testType.contains("X_RAY") || testType.contains("MRI") || testType.contains("CT"))
                ? InvoiceItemType.IMAGING : InvoiceItemType.LAB_TEST;

        InvoiceItem item = InvoiceItem.builder()
                .description(testType + " Test")
                .itemType(itemType)
                .quantity(1)
                .unitPrice(amount)
                .total(amount)
                .referenceId(testRequestId)
                .invoice(invoice)
                .build();

        invoice.getItems().add(item);
        invoice.recalculateTotal();
        return InvoiceMapper.mapToDto(invoiceRepository.save(invoice));
    }

    /**
     * Returns the patient's most recent PENDING invoice,
     * or creates a new one if none exists.
     */
    private Invoice getOrCreateOpenInvoice(Long patientId) {
        return invoiceRepository.findByPatientId(patientId).stream()
                .filter(inv -> inv.getStatus() == InvoiceStatus.PENDING
                            || inv.getStatus() == InvoiceStatus.PARTIAL)
                .findFirst()
                .orElseGet(() -> {
                    Patient patient = patientRepository.findById(patientId)
                            .orElseThrow(() -> new UserNotFoundException("Patient not found: " + patientId));
                    Invoice newInvoice = Invoice.builder()
                            .invoiceNumber(generateInvoiceNumber())
                            .status(InvoiceStatus.PENDING)
                            .totalAmount(0.0)
                            .paidAmount(0.0)
                            .patient(patient)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return invoiceRepository.save(newInvoice);
                });
    }
}
