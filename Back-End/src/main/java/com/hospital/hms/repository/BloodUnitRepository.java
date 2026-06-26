package com.hospital.hms.repository;

import com.hospital.hms.Enum.BloodType;
import com.hospital.hms.Enum.BloodUnitStatus;
import com.hospital.hms.entity.BloodUnit;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BloodUnitRepository extends JpaRepository<BloodUnit, Long> {

    /**
     * Find all AVAILABLE units of a given blood type with enough quantity
     * and not yet expired — ordered oldest-first (use near-expiry first).
     * PESSIMISTIC_WRITE lock prevents concurrent transactions from reserving
     * the same units simultaneously.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT u FROM BloodUnit u
            WHERE u.bloodType = :bloodType
              AND u.status = com.hospital.hms.Enum.BloodUnitStatus.AVAILABLE
              AND (u.expiryDate IS NULL OR u.expiryDate >= :today)
              AND u.quantity > 0
            ORDER BY u.expiryDate ASC NULLS LAST, u.createdAt ASC
            """)
    List<BloodUnit> findAvailableUnits(
            @Param("bloodType") BloodType bloodType,
            @Param("today") LocalDate today);

    List<BloodUnit> findByBloodType(BloodType bloodType);

    List<BloodUnit> findByStatus(BloodUnitStatus status);

    /** Used by the low-stock check: count AVAILABLE, non-expired units per blood type. */
    @Query("""
            SELECT COALESCE(SUM(u.quantity), 0) FROM BloodUnit u
            WHERE u.bloodType = :bloodType
              AND u.status = com.hospital.hms.Enum.BloodUnitStatus.AVAILABLE
              AND (u.expiryDate IS NULL OR u.expiryDate >= :today)
            """)
    int sumAvailableQuantity(
            @Param("bloodType") BloodType bloodType,
            @Param("today") LocalDate today);

    /** Expired units still marked AVAILABLE — used by a maintenance sweep. */
    List<BloodUnit> findByExpiryDateBeforeAndStatus(LocalDate date, BloodUnitStatus status);
}
