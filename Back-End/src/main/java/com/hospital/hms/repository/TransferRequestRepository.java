package com.hospital.hms.repository;

import com.hospital.hms.Enum.TransferStatus;
import com.hospital.hms.entity.TransferRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TransferRequestRepository extends JpaRepository<TransferRequest, Long> {
    List<TransferRequest> findByPatient_Id(Long patientId);
    List<TransferRequest> findByStatus(TransferStatus status);
    List<TransferRequest> findByToHospital_Id(Long hospitalId);

    @Modifying
    @Transactional
    void deleteByPatient_Id(Long patientId);
}
