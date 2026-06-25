package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.dto.ReceptionistDto;
import com.hospital.hms.entity.Receptionist;
import com.hospital.hms.exception.UserNameAlreadyExistException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.ReceptionistMapper;
import com.hospital.hms.repository.ReceptionistRepository;
import com.hospital.hms.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
@Service
@RequiredArgsConstructor
public class ReceptionistServiceImpl implements ReceptionistService {
    private final ReceptionistRepository receptionistRepository;
    private final PasswordEncoder passwordEncoder;
    @Override
    public List<ReceptionistDto> getAllReceptionist() {
        return receptionistRepository.findAll().stream()
                .map(ReceptionistMapper::mapToDto).toList();
    }

    @Override
    public ReceptionistDto getReceptionistById(Long id) {
        Receptionist receptionist= receptionistRepository.findById(id)
                .orElseThrow(()->new UserNotFoundException("Nurse not found"));
        return ReceptionistMapper.mapToDto(receptionist);
    }

    @Override
    public List<ReceptionistDto> getReceptionistByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return Collections.emptyList();
        }
        List<Receptionist> receptionists = receptionistRepository.findByNameContainingIgnoreCase(name);
        return receptionists.stream().map(ReceptionistMapper::mapToDto).toList();
    }

    @Override
    public ReceptionistDto getReceptionistByNationalId(String nationalId) {
        if (nationalId == null || nationalId.trim().isEmpty()) {
            throw new UserNotFoundException("National ID cannot be empty");
        }
        Receptionist receptionist = receptionistRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new UserNotFoundException("Receptionist not found"));
        return ReceptionistMapper.mapToDto(receptionist);
    }

    @Override
    public ReceptionistDto updateReceptionist(Long id, ReceptionistDto receptionistDto) {
        Receptionist existingRec = receptionistRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Receptionist not found with id: " + id));

        if (receptionistDto.getUsername() != null &&
                !receptionistDto.getUsername().equals(existingRec.getUsername())) {
            if (receptionistRepository.findByUsername(receptionistDto.getUsername()).isPresent()) {
                throw new UserNameAlreadyExistException("Username already exists, choose another one");
            }
            existingRec.setUsername(receptionistDto.getUsername());
        }
        if (receptionistDto.getName() != null) {
            existingRec.setName(receptionistDto.getName());
        }
        if (receptionistDto.getEmail() != null) {
            existingRec.setEmail(receptionistDto.getEmail());
        }
        if (receptionistDto.getPhone() != null) {
            existingRec.setPhone(receptionistDto.getPhone());
        }
        if (receptionistDto.getAddress() != null) {
            existingRec.setAddress(receptionistDto.getAddress());
        }
        if (receptionistDto.getCustomerServiceTraining() != null) {
            existingRec.setCustomerServiceTraining(
                com.hospital.hms.config.DateUtils.parse(receptionistDto.getCustomerServiceTraining()));
        }
        if (receptionistDto.getShift() != null) {
            existingRec.setShift(receptionistDto.getShift());
        }
        if (receptionistDto.getSpecialityArea() != null) {
            existingRec.setSpecialityArea(receptionistDto.getSpecialityArea());
        }
        if (receptionistDto.getHipaaTrainingDate() != null) {
            existingRec.setHipaaTrainingDate(
                com.hospital.hms.config.DateUtils.parse(receptionistDto.getHipaaTrainingDate()));
        }
        if (receptionistDto.getEmploymentStatus() != null) {
            existingRec.setEmploymentStatus(EmploymentStatus.valueOf(receptionistDto.getEmploymentStatus().toUpperCase()));
        }
        existingRec.setUpdatedAt(LocalDateTime.now());

        Receptionist savedReceptionist = receptionistRepository.save(existingRec);
        return ReceptionistMapper.mapToDto(savedReceptionist);
    }

    @Override
    public void deleteReceptionist(Long id) {
        Receptionist receptionist= receptionistRepository.findById(id)
                .orElseThrow(()-> new UserNotFoundException("Receptionist not found"));
        receptionistRepository.delete(receptionist);
    }

    @Override
    public ReceptionistDto createReceptionist(ReceptionistDto receptionistDto) {
        if(receptionistRepository.findByUsername(receptionistDto.getUsername()).isPresent()) {
            throw new UserNameAlreadyExistException("Username already exist, choose another one");
        }
        Receptionist receptionist = ReceptionistMapper.mapFromDto(receptionistDto);
        receptionist.setCreatedAt(LocalDateTime.now());
        receptionist.setUpdatedAt(LocalDateTime.now());
        receptionist.setUserStatus(UserStatus.ACTIVE);
        // encode password
        if (receptionist.getPassword() != null && !receptionist.getPassword().isBlank()) {
            receptionist.setPassword(passwordEncoder.encode(receptionist.getPassword()));
        } else {
            receptionist.setPassword(passwordEncoder.encode("changeme123"));
        }
        if (receptionist.getAvatar() == null) {
            receptionist.setAvatar("default-avatar.png");
        }
        if (receptionist.getRole() == null) {
            receptionist.setRole(UserRole.RECEPTIONIST);
        }
        if(receptionist.getDateOfBirth() == null){
            receptionist.setDateOfBirth(java.time.LocalDate.of(2000, 10, 10));
        }
        // fix: was incorrectly calling setDateOfBirth instead of the correct setters
        if(receptionist.getHipaaTrainingDate() == null){
            receptionist.setHipaaTrainingDate(java.time.LocalDate.of(2020, 1, 1));
        }
        if(receptionist.getCustomerServiceTraining() == null){
            receptionist.setCustomerServiceTraining(java.time.LocalDate.of(2020, 1, 1));
        }
        if(receptionist.getShift() == null){
            receptionist.setShift("day");
        }
        if(receptionist.getSpecialityArea() == null){
            receptionist.setSpecialityArea("out patient");
        }
        if(receptionist.getEmploymentStatus() == null){
            receptionist.setEmploymentStatus(EmploymentStatus.CASUAL);
        }
        Receptionist savedReceptionist= receptionistRepository.save(receptionist);
        return ReceptionistMapper.mapToDto(savedReceptionist);
    }

    @Override
    public List<ReceptionistDto> getReceptionistByEmploymentStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            EmploymentStatus enumStatus = EmploymentStatus.valueOf(status.toUpperCase());
            return receptionistRepository.findByEmploymentStatus(enumStatus)
                    .stream()
                    .map(ReceptionistMapper::mapToDto)
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid employment status: " + status);
        }
    }

    @Override
    public List<ReceptionistDto> getReceptionistBySpecialityArea(String specialityArea) {
        if (specialityArea == null || specialityArea.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return receptionistRepository.findBySpecialityAreaContainingIgnoreCase(specialityArea.trim())
                .stream().map(ReceptionistMapper::mapToDto)
                .toList();
    }

}
