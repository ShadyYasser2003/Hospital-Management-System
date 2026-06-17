package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.dto.NurseDto;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Nurse;
import com.hospital.hms.entity.Speciality;
import com.hospital.hms.exception.UserNameAlreadyExistException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.NurseMapper;
import com.hospital.hms.mapper.PatientMapper;
import com.hospital.hms.repository.NurseRepository;
import com.hospital.hms.repository.SpecialityRepository;
import com.hospital.hms.service.NurseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NurseServiceImpl implements NurseService {
    private final NurseRepository nurseRepository;
    private final SpecialityRepository specialityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<NurseDto> getAllNurses() {
        return nurseRepository.findAll().stream()
                .map(NurseMapper::mapToNurseDto).toList();
    }

    @Override
    public NurseDto getNurseById(Long id) {
         Nurse nurse= nurseRepository.findById(id).orElseThrow(()->new RuntimeException("Nurse not found"));
         return NurseMapper.mapToNurseDto(nurse);
    }

    @Override
    public List<NurseDto> getNurseByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return nurseRepository.findByNameContainingIgnoreCase(name)
                .stream().map(NurseMapper::mapToNurseDto).toList();
    }

    @Override
    public NurseDto getNurseByNationalId(String nationalId) {
        if (nationalId == null || nationalId.trim().isEmpty()) {
            throw new UserNotFoundException("National ID cannot be empty");
        }
        Nurse nurse = nurseRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new UserNotFoundException("Nurse not found"));
        return NurseMapper.mapToNurseDto(nurse);
    }

    @Override
    public NurseDto updateNurse(Long id, NurseDto nurseDto) {
        Nurse existingNurse = nurseRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Nurse not found with id: " + id));

        if (nurseDto.getUsername() != null &&
                !nurseDto.getUsername().equals(existingNurse.getUsername())) {
            if (nurseRepository.findByUsername(nurseDto.getUsername()).isPresent()) {
                throw new UserNameAlreadyExistException("Username already exists, choose another one");
            }
            existingNurse.setUsername(nurseDto.getUsername());
        }
        if (nurseDto.getName() != null) {
            existingNurse.setName(nurseDto.getName());
        }
        if (nurseDto.getEmail() != null) {
            existingNurse.setEmail(nurseDto.getEmail());
        }
        if (nurseDto.getPhone() != null) {
            existingNurse.setPhone(nurseDto.getPhone());
        }
        if (nurseDto.getAddress() != null) {
            existingNurse.setAddress(nurseDto.getAddress());
        }
        if (nurseDto.getLicenseNumber() != null) {
            existingNurse.setLicenseNumber(nurseDto.getLicenseNumber());
        }
        if (nurseDto.getSpecialization() != null) {
            existingNurse.setSpecialization(nurseDto.getSpecialization());
        }
        if (nurseDto.getYearsOfExperience() != null) {
            existingNurse.setYearsOfExperience(nurseDto.getYearsOfExperience());
        }
        if (nurseDto.getEmploymentStatus() != null) {
            existingNurse.setEmploymentStatus(EmploymentStatus.valueOf(nurseDto.getEmploymentStatus().toUpperCase()));
        }
        if (nurseDto.getShift() != null) {
            existingNurse.setShift(nurseDto.getShift());
        }
        existingNurse.setUpdatedAt(LocalDateTime.now());

        Nurse savedNurse = nurseRepository.save(existingNurse);
        return NurseMapper.mapToNurseDto(savedNurse);
    }

    @Override
    public void deleteNurse(Long id) {
        Nurse nurse= nurseRepository.findById(id).orElseThrow(()-> new UserNotFoundException("Nurse not found"));
        nurseRepository.delete(nurse);
    }

    @Override
    public NurseDto createNurse(NurseDto nurseDto) {
        if(nurseRepository.findByUsername(nurseDto.getUsername()).isPresent()) {
            throw new UserNameAlreadyExistException("Username already exist, choose another one");
        }
        Nurse nurse = NurseMapper.mapToNurse(nurseDto);
        nurse.setCreatedAt(LocalDateTime.now());
        nurse.setUpdatedAt(LocalDateTime.now());
        nurse.setUserStatus(UserStatus.ACTIVE);
        // encode password
        if (nurse.getPassword() != null && !nurse.getPassword().isBlank()) {
            nurse.setPassword(passwordEncoder.encode(nurse.getPassword()));
        } else {
            nurse.setPassword(passwordEncoder.encode("changeme123"));
        }
        if (nurse.getAvatar() == null) {
            nurse.setAvatar("default-avatar.png");
        }
        if (nurse.getRole() == null) {
            nurse.setRole(UserRole.NURSE);
        }
        if (nurse.getDateOfBirth() == null) {
            nurse.setDateOfBirth(java.time.LocalDate.of(2000, 10, 10));
        }
        // licenseNumber is nullable in DB — set a placeholder if blank
        if (nurse.getLicenseNumber() == null || nurse.getLicenseNumber().isBlank()) {
            nurse.setLicenseNumber("PENDING");
        }
        // speciality is optional for nurses
        if (nurseDto.getSpecialization() != null && !nurseDto.getSpecialization().isBlank()) {
            specialityRepository.findByNameContainingIgnoreCase(nurseDto.getSpecialization())
                    .ifPresent(speciality -> {
                        nurse.setSpeciality(speciality);
                        if (speciality.getNurses() == null) {
                            speciality.setNurses(new java.util.ArrayList<>());
                        }
                        speciality.getNurses().add(nurse);
                        specialityRepository.save(speciality);
                    });
        }
        Nurse Savednurse= nurseRepository.save(nurse);
        return NurseMapper.mapToNurseDto(Savednurse);
    }
    @Override
    public List<NurseDto> getNurseByEmploymentStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            EmploymentStatus enumStatus = EmploymentStatus.valueOf(status.toUpperCase());
            return nurseRepository.findByEmploymentStatus(enumStatus)
                    .stream()
                    .map(NurseMapper::mapToNurseDto)
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid employment status: " + status);
        }
    }

    @Override
    public List<NurseDto> getNurseBySpecialization(String specialization) {
        if (specialization == null || specialization.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return nurseRepository.findBySpecializationContainingIgnoreCase(specialization.trim())
                .stream().map(NurseMapper::mapToNurseDto)
                .toList();
    }
    @Override
    public List<PatientDTO> getNursePatients(Long id){
        Nurse nurse= nurseRepository.findById(id)
                .orElseThrow(()->new UserNotFoundException("Nurse not found"));
        if(nurse.getPatients() == null){
            return Collections.emptyList();
        }
        return nurse.getPatients().stream().map(PatientMapper::mapToPatientDto).toList();
    }
}
