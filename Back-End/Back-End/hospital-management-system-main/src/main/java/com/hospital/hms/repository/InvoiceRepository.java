package com.hospital.hms.repository;

import com.hospital.hms.Enum.InvoiceStatus;
import com.hospital.hms.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByPatientId(Long patientId);

    Page<Invoice> findByPatientId(Long patientId, Pageable pageable);

    List<Invoice> findByStatus(InvoiceStatus status);

    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    Page<Invoice> findAll(Pageable pageable);
}
