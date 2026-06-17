package com.hospital.hms.service;

import com.hospital.hms.dto.TechnicianDto;

import java.util.List;

public interface TechnicianService {

    TechnicianDto createTechnician(TechnicianDto dto);

    TechnicianDto getById(Long id);

    List<TechnicianDto> getAll();

    TechnicianDto update(Long id, TechnicianDto dto);

    void delete(Long id);

    List<TechnicianDto> searchByName(String name);

    TechnicianDto getByNationalId(String nationalId);
}
