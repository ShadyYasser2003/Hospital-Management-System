package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.TechnicianSpecialization;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.dto.TechnicianDto;
import com.hospital.hms.entity.Department;
import com.hospital.hms.entity.Technician;
import com.hospital.hms.exception.UserNameAlreadyExistException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.repository.DepartmentRepository;
import com.hospital.hms.repository.TechnicianRepository;
import com.hospital.hms.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.hospital.hms.mapper.TechnicianMapper;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
@Service
@RequiredArgsConstructor
public class TechnicianServiceImpl implements TechnicianService {
    private final TechnicianRepository technicianRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;



    @Override
    public List<TechnicianDto> getAllTechnicians() {
        return technicianRepository.findAll().stream()
                .map(TechnicianMapper::mapToDto).toList();
    }

    @Override
    public TechnicianDto getTechnicianById(Long id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Technician not found"));
        return TechnicianMapper.mapToDto(technician);
    }

    @Override
    public TechnicianDto getTechnicianByNationalId(String nationalId) {
        if (nationalId == null || nationalId.trim().isEmpty()) {
            throw new UserNotFoundException("National ID cannot be empty");
        }
        Technician technician = technicianRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new UserNotFoundException("Technician not found"));
        return TechnicianMapper.mapToDto(technician);
    }

    @Override
    public List<TechnicianDto> getTechniciansByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return technicianRepository.findByNameContainingIgnoreCase(name)
                .stream().map(TechnicianMapper::mapToDto).toList();
    }

    @Override
    public List<TechnicianDto> getTechniciansBySpecialization(String specialization) {
        if (specialization == null || specialization.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return technicianRepository.findBySpecialization(TechnicianSpecialization.valueOf(specialization.trim()))
                .stream().map(TechnicianMapper::mapToDto)
                .toList();
    }

    @Override
    public List<TechnicianDto> getTechniciansByEmploymentStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            EmploymentStatus enumStatus = EmploymentStatus.valueOf(status.toUpperCase());
            return technicianRepository.findByEmploymentStatus(enumStatus)
                    .stream()
                    .map(TechnicianMapper::mapToDto)
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid employment status: " + status);
        }

}

    @Override
    public List<TechnicianDto> getTechniciansByDepartment(Long departmentId) {
        if (departmentId == null) {
            return Collections.emptyList();
        }
        return technicianRepository.findByDepartment_Id(departmentId)
                .stream().map(TechnicianMapper::mapToDto)
                .toList();
    }

    @Override
    public TechnicianDto createTechnician(TechnicianDto technicianDto) {
        if (technicianRepository.findByUsername(technicianDto.getUsername()).isPresent()) {
            throw new UserNameAlreadyExistException("Username already exist, choose another one");
        }

        Technician technician = TechnicianMapper.mapToEntity(technicianDto);
        technician.setCreatedAt(LocalDateTime.now());
        technician.setUpdatedAt(LocalDateTime.now());
        technician.setUserStatus(UserStatus.ACTIVE);

        if (technician.getPassword() != null && !technician.getPassword().isBlank()) {
            technician.setPassword(passwordEncoder.encode(technician.getPassword()));
        } else {
            technician.setPassword(passwordEncoder.encode("changeme123"));
        }


        if (technician.getAvatar() == null) {
            technician.setAvatar("default-avatar.png");
        }
        if (technician.getRole() == null) {
            technician.setRole(UserRole.TECHNICIAN);
        }
        if (technician.getDateOfBirth() == null) {
            technician.setDateOfBirth(java.time.LocalDate.of(2000, 10, 10));
        }
        if (technician.getLicenseNumber() == null) {
            technician.setLicenseNumber("N/A");
        }
        if (technician.getShift() == null) {
            technician.setShift("day");
        }
        if (technician.getEmploymentStatus() == null) {
            technician.setEmploymentStatus(EmploymentStatus.FULL_TIME);
        }
        if (technician.getHireDate() == null) {
            technician.setHireDate(java.time.LocalDate.now());
        }

        if (technicianDto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(technicianDto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + technicianDto.getDepartmentId()));
            technician.setDepartment(department);
        }

        Technician savedTechnician = technicianRepository.save(technician);
        return TechnicianMapper.mapToDto(savedTechnician);
    }


    @Override
    public TechnicianDto updateTechnician(Long id, TechnicianDto technicianDto) {
        Technician existingTechnician = technicianRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Technician not found with id: " + id));

        if (technicianDto.getUsername() != null &&
                !technicianDto.getUsername().equals(existingTechnician.getUsername())) {
            if (technicianRepository.findByUsername(technicianDto.getUsername()).isPresent()) {
                throw new UserNameAlreadyExistException("Username already exists, choose another one");
            }
            existingTechnician.setUsername(technicianDto.getUsername());
        }
        if (technicianDto.getName() != null) {
            existingTechnician.setName(technicianDto.getName());
        }
        if (technicianDto.getEmail() != null) {
            existingTechnician.setEmail(technicianDto.getEmail());
        }
        if (technicianDto.getPhone() != null) {
            existingTechnician.setPhone(technicianDto.getPhone());
        }
        if (technicianDto.getAddress() != null) {
            existingTechnician.setAddress(technicianDto.getAddress());
        }
        if (technicianDto.getLicenseNumber() != null) {
            existingTechnician.setLicenseNumber(technicianDto.getLicenseNumber());
        }
        if (technicianDto.getSpecialization() != null) {
            existingTechnician.setSpecialization(TechnicianSpecialization.valueOf(String.valueOf(technicianDto.getSpecialization())));
        }
        if (technicianDto.getYearsOfExperience() != null) {
            existingTechnician.setYearsOfExperience(technicianDto.getYearsOfExperience());
        }
        if (technicianDto.getHireDate() != null) {
            existingTechnician.setHireDate(com.hospital.hms.config.DateUtils.parse(technicianDto.getHireDate()));
        }
        if (technicianDto.getEmploymentStatus() != null) {
            existingTechnician.setEmploymentStatus(EmploymentStatus.valueOf(technicianDto.getEmploymentStatus().toUpperCase()));
        }
        if (technicianDto.getShift() != null) {
            existingTechnician.setShift(technicianDto.getShift());
        }
        if (technicianDto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(technicianDto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + technicianDto.getDepartmentId()));
            existingTechnician.setDepartment(department);
        }
        existingTechnician.setUpdatedAt(LocalDateTime.now());

        Technician savedTechnician = technicianRepository.save(existingTechnician);
        return TechnicianMapper.mapToDto(savedTechnician);
    }

    @Override
    public void deleteTechnician(Long id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Technician not found"));
        technicianRepository.delete(technician);
    }

}
