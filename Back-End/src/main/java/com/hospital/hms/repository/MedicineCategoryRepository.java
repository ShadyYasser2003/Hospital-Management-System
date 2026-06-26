package com.hospital.hms.repository;

import com.hospital.hms.entity.MedicineCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicineCategoryRepository extends JpaRepository<MedicineCategory, Long> {

    Optional<MedicineCategory> findByNameContainingIgnoreCase(String name);
}
