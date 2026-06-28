package com.hospital.hms.repository;

import com.hospital.hms.Enum.BloodRequestStatus;
import com.hospital.hms.Enum.BloodType;
import com.hospital.hms.entity.BloodRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByPatient_Id(Long patientId);
    List<BloodRequest> findByStatus(BloodRequestStatus status);
    List<BloodRequest> findByBloodTypeAndStatus(BloodType bloodType, BloodRequestStatus status);

    @Modifying
    @Transactional
    void deleteByPatient_Id(Long patientId);
}
