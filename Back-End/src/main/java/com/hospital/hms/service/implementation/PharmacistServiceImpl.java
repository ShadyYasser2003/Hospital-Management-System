package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.dto.PharmacistDto;
import com.hospital.hms.entity.Department;
import com.hospital.hms.entity.Pharmacist;
import com.hospital.hms.exception.UserNameAlreadyExistException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.PharmacistMapper;
import com.hospital.hms.repository.DepartmentRepository;
import com.hospital.hms.repository.PharmacistRepository;
import com.hospital.hms.service.PharmacistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PharmacistServiceImpl implements PharmacistService {
    private final PharmacistRepository repository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    @Override
    public List<PharmacistDto> getAllPharmacists() {
        List<Pharmacist> pharmacists= repository.findAll();
        return pharmacists.stream().map(PharmacistMapper::mapToDto).toList();
    }

    @Override
    public PharmacistDto getPharmacistById(Long id) {
        Pharmacist pharmacist= repository.findById(id)
                .orElseThrow(()->new UserNotFoundException("Pharmacist not found with id: "+id));
        return PharmacistMapper.mapToDto(pharmacist);
    }

    @Override
    public List<PharmacistDto> getPharmacistByName(String name) {
        if(name== null || name.trim().isEmpty())
            return Collections.emptyList();
        return repository.findByNameContainingIgnoreCase(name.trim())
                .stream().map(PharmacistMapper::mapToDto).toList();
    }

    @Override
    public PharmacistDto getPharmacistByNationalId(String nationalId) {
        if(nationalId == null || nationalId.trim().isEmpty())
            return null;
        Pharmacist pharmacist= repository.findByNationalId(nationalId)
                .orElseThrow(()->new UserNotFoundException("Pharmacist not found"));
        return PharmacistMapper.mapToDto(pharmacist);
    }

    @Override
    public PharmacistDto updatePharmacist(Long id, PharmacistDto pharmacistDto) {
        Pharmacist existingPharmacist = repository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Pharmacist not found with id: " + id));

        if (pharmacistDto.getUsername() != null &&
                !pharmacistDto.getUsername().equals(existingPharmacist.getUsername())) {
            if (repository.findByUsername(pharmacistDto.getUsername()).isPresent()) {
                throw new UserNameAlreadyExistException("Username already exists, choose another one");
            }
            existingPharmacist.setUsername(pharmacistDto.getUsername());
        }
        if (pharmacistDto.getName() != null) {
            existingPharmacist.setName(pharmacistDto.getName());
        }
        if (pharmacistDto.getEmail() != null) {
            existingPharmacist.setEmail(pharmacistDto.getEmail());
        }
        if (pharmacistDto.getPhone() != null) {
            existingPharmacist.setPhone(pharmacistDto.getPhone());
        }
        if (pharmacistDto.getAddress() != null) {
            existingPharmacist.setAddress(pharmacistDto.getAddress());
        }
        if (pharmacistDto.getLicenseNumber() != null) {
            existingPharmacist.setLicenseNumber(pharmacistDto.getLicenseNumber());
        }
        if (pharmacistDto.getShift() != null) {
            existingPharmacist.setShift(pharmacistDto.getShift());
        }
        if (pharmacistDto.getLicenseExpiryDate() != null) {
            existingPharmacist.setLicenseExpiryDate(
                com.hospital.hms.config.DateUtils.parse(pharmacistDto.getLicenseExpiryDate()));
        }
        existingPharmacist.setUpdatedAt(LocalDateTime.now());

        Pharmacist saved= repository.save(existingPharmacist);
        return PharmacistMapper.mapToDto(saved);
    }

    @Override
    public void deletePharmacist(Long id) {
        Pharmacist pharmacist= repository.findById(id)
                        .orElseThrow(()->new UserNotFoundException("Pharmacist not found with id: "+id));
        repository.delete(pharmacist);
    }

    @Override
    public PharmacistDto createPharmacist(PharmacistDto pharmacistDto) {
        if(repository.findByUsername(pharmacistDto.getUsername()).isPresent()) {
            throw new UserNameAlreadyExistException("Username already exist, choose another one");
        }
        Pharmacist pharmacist = PharmacistMapper.mapFromDto(pharmacistDto);
        pharmacist.setCreatedAt(LocalDateTime.now());
        pharmacist.setUpdatedAt(LocalDateTime.now());
        pharmacist.setUserStatus(UserStatus.ACTIVE);
        // encode password
        if (pharmacist.getPassword() != null && !pharmacist.getPassword().isBlank()) {
            pharmacist.setPassword(passwordEncoder.encode(pharmacist.getPassword()));
        } else {
            pharmacist.setPassword(passwordEncoder.encode("changeme123"));
        }
        if (pharmacist.getAvatar() == null) {
            pharmacist.setAvatar("default-avatar.png");
        }
        if (pharmacist.getRole() == null) {
            pharmacist.setRole(UserRole.PHARMACIST);  // fix: was DOCTOR
        }
        if(pharmacist.getDateOfBirth() == null){
            pharmacist.setDateOfBirth(LocalDate.of(2000,10,10));
        }
        Pharmacist saved= repository.save(pharmacist);
        return PharmacistMapper.mapToDto(saved);

    }

    @Override
    public List<PharmacistDto> findPharmacistsByDepartment(Long departmentId) {
        Department department= departmentRepository.findById(departmentId)
                .orElseThrow(()->new RuntimeException("No such department with id: "+departmentId));
        List<Pharmacist> pharmacists= repository.findByDepartment(department);
        if(pharmacists == null){
            return Collections.emptyList();
        }
        return pharmacists.stream().map(PharmacistMapper::mapToDto).toList();
    }
}
