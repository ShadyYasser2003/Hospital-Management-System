package com.hospital.hms.service;

import com.hospital.hms.dto.RadiologyOrderDto;

import java.util.List;

public interface RadiologyOrderService {
    List<RadiologyOrderDto> getAllOrders();

    RadiologyOrderDto getOrderById(Long id);

    List<RadiologyOrderDto> getOrdersByPatient(Long patientId);

    List<RadiologyOrderDto> getOrdersByDoctor(Long doctorId);

    List<RadiologyOrderDto> getOrdersByTechnician(Long technicianId);

    List<RadiologyOrderDto> getOrdersByStatus(String status);

    List<RadiologyOrderDto> getOrdersByType(String orderType);

    List<RadiologyOrderDto> getCriticalOrders();

    List<RadiologyOrderDto> getOrdersByPatientAndStatus(Long patientId, String status);

    RadiologyOrderDto createOrder(RadiologyOrderDto dto);

    RadiologyOrderDto updateOrder(Long id, RadiologyOrderDto dto);

    RadiologyOrderDto assignTechnician(Long orderId, Long technicianId);

    RadiologyOrderDto scheduleOrder(Long orderId, String scheduledAt);

    RadiologyOrderDto enterReport(Long orderId, String reportFindings, String impression,
                                  String imageUrl, Boolean isCritical, String notes);

    void deleteOrder(Long id);
}
