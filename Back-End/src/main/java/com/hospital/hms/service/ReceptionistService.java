package com.hospital.hms.service;

import com.hospital.hms.dto.ReceptionistDto;

import java.util.List;

public interface ReceptionistService {
    List<ReceptionistDto> getAllReceptionist();
    ReceptionistDto getReceptionistById(Long id);
    List<ReceptionistDto> getReceptionistByName(String name);
    ReceptionistDto getReceptionistByNationalId(String nationalId);
    ReceptionistDto updateReceptionist(Long id, ReceptionistDto receptionistDto);
    void deleteReceptionist(Long id);
    ReceptionistDto createReceptionist(ReceptionistDto receptionistDto);
    List<ReceptionistDto> getReceptionistByEmploymentStatus(String status);
    List<ReceptionistDto> getReceptionistBySpecialityArea(String specialization);
}
