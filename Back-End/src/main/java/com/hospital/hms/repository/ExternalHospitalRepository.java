package com.hospital.hms.repository;

import com.hospital.hms.entity.ExternalHospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalHospitalRepository extends JpaRepository<ExternalHospital, Long> {

    Optional<ExternalHospital> findByEmail(String email);

    List<ExternalHospital> findByIsActiveTrue();

    boolean existsByEmail(String email);
}