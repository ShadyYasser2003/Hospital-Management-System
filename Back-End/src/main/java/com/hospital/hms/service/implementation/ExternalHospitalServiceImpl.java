package com.hospital.hms.service.implementation;

import com.hospital.hms.dto.ExternalHospitalDto;
import com.hospital.hms.entity.ExternalHospital;
import com.hospital.hms.mapper.ExternalHospitalMapper;
import com.hospital.hms.repository.ExternalHospitalRepository;
import com.hospital.hms.service.ExternalHospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExternalHospitalServiceImpl implements ExternalHospitalService {

    private final ExternalHospitalRepository externalHospitalRepository;



    @Override
    public List<ExternalHospitalDto> getAllHospitals() {
        return externalHospitalRepository.findByIsActiveTrue()
                .stream().map(ExternalHospitalMapper::mapToDto).toList();
    }

    @Override
    public ExternalHospitalDto getHospitalById(Long id) {
        return ExternalHospitalMapper.mapToDto(findOrThrow(id));
    }


    @Override
    public ExternalHospitalDto createHospital(ExternalHospitalDto dto) {
        if (dto.getName() == null || dto.getName().isBlank())
            throw new RuntimeException("Hospital name is required");

        if (dto.getEmail() == null || dto.getEmail().isBlank())
            throw new RuntimeException("Hospital email is required");

        if (externalHospitalRepository.existsByEmail(dto.getEmail()))
            throw new RuntimeException("Hospital with this email already exists: " + dto.getEmail());

        ExternalHospital hospital = ExternalHospitalMapper.mapToEntity(dto);
        hospital.setCreatedAt(LocalDateTime.now());
        hospital.setIsActive(true);

        return ExternalHospitalMapper.mapToDto(externalHospitalRepository.save(hospital));
    }



    @Override
    public ExternalHospitalDto updateHospital(Long id, ExternalHospitalDto dto) {
        ExternalHospital existing = findOrThrow(id);

        if (dto.getName() != null)    existing.setName(dto.getName());
        if (dto.getPhone() != null)   existing.setPhone(dto.getPhone());
        if (dto.getAddress() != null) existing.setAddress(dto.getAddress());
        if (dto.getIsActive() != null) existing.setIsActive(dto.getIsActive());

        // Email change guard
        if (dto.getEmail() != null && !dto.getEmail().equals(existing.getEmail())) {
            if (externalHospitalRepository.existsByEmail(dto.getEmail()))
                throw new RuntimeException("Email already used by another hospital: " + dto.getEmail());
            existing.setEmail(dto.getEmail());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return ExternalHospitalMapper.mapToDto(externalHospitalRepository.save(existing));
    }


    @Override
    public void deleteHospital(Long id) {
        ExternalHospital hospital = findOrThrow(id);
        // Soft delete
        hospital.setIsActive(false);
        hospital.setUpdatedAt(LocalDateTime.now());
        externalHospitalRepository.save(hospital);
    }


    private ExternalHospital findOrThrow(Long id) {
        return externalHospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "External hospital not found with id: " + id));
    }
}
