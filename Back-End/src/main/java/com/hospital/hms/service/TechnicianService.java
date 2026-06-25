package com.hospital.hms.service;

import com.hospital.hms.dto.TechnicianDto;

import java.util.List;

public interface TechnicianService {

    List<TechnicianDto> getAllTechnicians();

    TechnicianDto getTechnicianById(Long id);

    TechnicianDto getTechnicianByNationalId(String nationalId);

    List<TechnicianDto> getTechniciansByName(String name);

    List<TechnicianDto> getTechniciansBySpecialization(String specialization);

    List<TechnicianDto> getTechniciansByEmploymentStatus(String status);

    List<TechnicianDto> getTechniciansByDepartment(Long departmentId);

    TechnicianDto createTechnician(TechnicianDto technicianDto);

    TechnicianDto updateTechnician(Long id, TechnicianDto technicianDto);

    void deleteTechnician(Long id);
}
