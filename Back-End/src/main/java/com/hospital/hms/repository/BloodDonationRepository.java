package com.hospital.hms.repository;

import com.hospital.hms.entity.BloodDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface BloodDonationRepository extends JpaRepository<BloodDonation, Long> {
    List<BloodDonation> findByTargetPatient_Id(Long patientId);
    List<BloodDonation> findByDonorNationalId(String nationalId);

    /** Nullify patient FK on directed donations when the patient is deleted */
    @Modifying
    @Transactional
    @Query("UPDATE BloodDonation d SET d.targetPatient = null WHERE d.targetPatient.id = :patientId")
    void clearTargetPatient(Long patientId);
}
