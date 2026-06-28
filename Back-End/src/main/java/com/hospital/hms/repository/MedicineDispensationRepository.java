package com.hospital.hms.repository;

import com.hospital.hms.Enum.DispensationStatus;
import com.hospital.hms.entity.MedicineDispensation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MedicineDispensationRepository extends JpaRepository<MedicineDispensation, Long> {
    List<MedicineDispensation> findAllByOrderByDispensedDateAsc();
    List<MedicineDispensation> findByStatus(DispensationStatus status);

    @Modifying
    @Transactional
    void deleteByPatient_Id(Long patientId);
}
