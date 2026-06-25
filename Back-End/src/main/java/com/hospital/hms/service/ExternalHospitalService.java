package com.hospital.hms.service;

import com.hospital.hms.dto.ExternalHospitalDto;

import java.util.List;

public interface ExternalHospitalService {

    List<ExternalHospitalDto> getAllHospitals();

    ExternalHospitalDto getHospitalById(Long id);

    ExternalHospitalDto createHospital(ExternalHospitalDto dto);

    ExternalHospitalDto updateHospital(Long id, ExternalHospitalDto dto);

    void deleteHospital(Long id);
}
