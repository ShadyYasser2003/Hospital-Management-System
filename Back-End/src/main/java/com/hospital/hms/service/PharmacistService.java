package com.hospital.hms.service;

import com.hospital.hms.dto.PharmacistDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PharmacistService {
    List<PharmacistDto> getAllPharmacists();
    PharmacistDto getPharmacistById(Long id);
    List<PharmacistDto> getPharmacistByName(String name);
    PharmacistDto getPharmacistByNationalId(String nationalId);
    PharmacistDto updatePharmacist(Long id, PharmacistDto pharmacistDto);
    void deletePharmacist(Long id);
    PharmacistDto createPharmacist(PharmacistDto pharmacistDto);
    List<PharmacistDto> findPharmacistsByDepartment(Long departmentId);
}
