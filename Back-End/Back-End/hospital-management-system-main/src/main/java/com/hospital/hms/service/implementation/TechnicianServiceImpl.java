package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.TechnicianDto;
import com.hospital.hms.entity.Technician;
import com.hospital.hms.exception.EmailAlreadyExistException;
import com.hospital.hms.exception.NationalIDAlreadyExists;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.TechnicianMapper;
import com.hospital.hms.repository.TechnicianRepository;
import com.hospital.hms.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TechnicianServiceImpl implements TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final com.hospital.hms.repository.UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public TechnicianDto createTechnician(TechnicianDto dto) {
        // Check both technicians table and users table for duplicates
        if (userRepository.findByNationalId(dto.getNationalId()).isPresent()) {
            throw new NationalIDAlreadyExists("National ID already exists: " + dto.getNationalId());
        }
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new com.hospital.hms.exception.UserNameAlreadyExistException("Username already exists: " + dto.getUsername());
        }

        Technician t = new Technician();
        t.setUsername(dto.getUsername());
        t.setName(dto.getName());
        t.setEmail(dto.getEmail());
        t.setNationalId(dto.getNationalId());
        t.setPassword(passwordEncoder.encode(dto.getPassword()));
        t.setPhone(dto.getPhone());
        t.setAddress(dto.getAddress() != null ? dto.getAddress() : "N/A");
        t.setDateOfBirth(dto.getDateOfBirth() != null
                ? com.hospital.hms.config.DateUtils.parse(dto.getDateOfBirth())
                : java.time.LocalDate.of(2000, 1, 1));
        t.setRole(UserRole.TECHNICIAN);
        t.setUserStatus(UserStatus.ACTIVE);
        t.setLicenseNumber(dto.getLicenseNumber());
        t.setSpecialization(dto.getSpecialization());
        t.setYearsOfExperience(dto.getYearsOfExperience());
        t.setShift(dto.getShift());
        if (dto.getEmploymentStatus() != null) {
            try { t.setEmploymentStatus(EmploymentStatus.valueOf(dto.getEmploymentStatus().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }

        Technician saved = technicianRepository.save(t);
        log.info("Technician created: {}", saved.getId());
        return TechnicianMapper.mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TechnicianDto getById(Long id) {
        return TechnicianMapper.mapToDto(
                technicianRepository.findById(id)
                        .orElseThrow(() -> new UserNotFoundException("Technician not found: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianDto> getAll() {
        return technicianRepository.findAll().stream()
                .map(TechnicianMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TechnicianDto update(Long id, TechnicianDto dto) {
        Technician t = technicianRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Technician not found: " + id));

        if (dto.getName() != null)             t.setName(dto.getName());
        if (dto.getEmail() != null)            t.setEmail(dto.getEmail());
        if (dto.getPhone() != null)            t.setPhone(dto.getPhone());
        if (dto.getAddress() != null)          t.setAddress(dto.getAddress());
        if (dto.getLicenseNumber() != null)    t.setLicenseNumber(dto.getLicenseNumber());
        if (dto.getSpecialization() != null)   t.setSpecialization(dto.getSpecialization());
        if (dto.getYearsOfExperience() != null) t.setYearsOfExperience(dto.getYearsOfExperience());
        if (dto.getShift() != null)            t.setShift(dto.getShift());
        if (dto.getEmploymentStatus() != null) {
            try { t.setEmploymentStatus(EmploymentStatus.valueOf(dto.getEmploymentStatus().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }

        return TechnicianMapper.mapToDto(technicianRepository.save(t));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Technician t = technicianRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Technician not found: " + id));
        technicianRepository.delete(t);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianDto> searchByName(String name) {
        return technicianRepository.findByNameContainingIgnoreCase(name).stream()
                .map(TechnicianMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TechnicianDto getByNationalId(String nationalId) {
        return TechnicianMapper.mapToDto(
                technicianRepository.findByNationalId(nationalId)
                        .orElseThrow(() -> new UserNotFoundException("Technician not found")));
    }
}
