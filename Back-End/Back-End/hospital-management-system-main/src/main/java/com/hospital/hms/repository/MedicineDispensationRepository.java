package com.hospital.hms.repository;

import com.hospital.hms.Enum.DispensationStatus;
import com.hospital.hms.entity.MedicineDispensation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineDispensationRepository extends JpaRepository<MedicineDispensation, Long> {

    List<MedicineDispensation> findAllByOrderByDispensedDateAsc();
    List<MedicineDispensation> findByStatus(DispensationStatus status);
}
