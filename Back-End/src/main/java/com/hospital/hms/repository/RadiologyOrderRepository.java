package com.hospital.hms.repository;

import com.hospital.hms.Enum.RadiologyOrderStatus;
import com.hospital.hms.Enum.RadiologyOrderType;
import com.hospital.hms.entity.RadiologyOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RadiologyOrderRepository extends JpaRepository<RadiologyOrder, Long> {
    List<RadiologyOrder> findByPatient_Id(Long patientId);
    List<RadiologyOrder> findByDoctor_Id(Long doctorId);
    List<RadiologyOrder> findByTechnician_Id(Long technicianId);
    List<RadiologyOrder> findByStatus(RadiologyOrderStatus status);
    List<RadiologyOrder> findByOrderType(RadiologyOrderType orderType);
    List<RadiologyOrder> findByPatient_IdAndStatus(Long patientId, RadiologyOrderStatus status);
    List<RadiologyOrder> findByIsCriticalTrue();

    @Modifying
    @Transactional
    void deleteByPatient_Id(Long patientId);
}
