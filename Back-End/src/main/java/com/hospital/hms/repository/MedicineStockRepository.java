package com.hospital.hms.repository;

import com.hospital.hms.entity.MedicineStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineStockRepository extends JpaRepository<MedicineStock, Long> {
    List<MedicineStock> findByCurrentQuantityLessThan(Integer minStock);
    List<MedicineStock> findAllByOrderByExpiryDateAsc();
}
