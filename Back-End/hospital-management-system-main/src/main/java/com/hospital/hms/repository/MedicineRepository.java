package com.hospital.hms.repository;

import com.hospital.hms.Enum.MedicineStatus;
import com.hospital.hms.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByNameContainingIgnoreCase(String name);
    Optional<Medicine> findByGenericNameContainingIgnoreCase(String name);

}
