package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Speciality;
import com.hospital.hms.exception.UserNameAlreadyExistException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.DoctorMapper;
import com.hospital.hms.mapper.PatientMapper;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.SpecialityRepository;
import com.hospital.hms.service.DoctorService;
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
public class DoctorServiceImpl implements DoctorService {
    private final DoctorRepository doctorRepository;
    private final SpecialityRepository specialityRepository;
    private final PasswordEncoder passwordEncoder;
    @Override
    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream().map(DoctorMapper::mapToDoctorDto).toList();
    }

    @Override
    public DoctorDto getDoctorById(Long id) {
        Doctor doctor= doctorRepository.findById(id).orElseThrow(()->new UserNotFoundException("Doctor not found"));
        return DoctorMapper.mapToDoctorDto(doctor);
    }

    @Override
    public DoctorDto createDoctor(DoctorDto doctorDto) {
        if(doctorRepository.findByUsername(doctorDto.getUsername()).isPresent()) {
            throw new UserNameAlreadyExistException("Username already exist, choose another one");
        }
        Doctor doctor = DoctorMapper.mapToDoctor(doctorDto);
        doctor.setCreatedAt(LocalDateTime.now());
        doctor.setUpdatedAt(LocalDateTime.now());
        doctor.setUserStatus(UserStatus.ACTIVE);
        // encode password
        if (doctor.getPassword() != null && !doctor.getPassword().isBlank()) {
            doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        } else {
            doctor.setPassword(passwordEncoder.encode("changeme123"));
        }
        if (doctor.getAvatar() == null) {
            doctor.setAvatar("default-avatar.png");
        }
        if (doctor.getRole() == null) {
            doctor.setRole(UserRole.DOCTOR);
        }
        if(doctor.getDateOfBirth() == null){
            doctor.setDateOfBirth(LocalDate.of(2000,10,10));
        }
        // Speciality is optional — only link if it exists
        if (doctorDto.getSpecialization() != null && !doctorDto.getSpecialization().isBlank()) {
            specialityRepository.findByNameContainingIgnoreCase(doctorDto.getSpecialization())
                    .ifPresent(speciality -> {
                        doctor.setSpeciality(speciality);
                        if (speciality.getDoctors() == null) {
                            speciality.setDoctors(new ArrayList<>());
                        }
                        speciality.getDoctors().add(doctor);
                        specialityRepository.save(speciality);
                    });
        }
        Doctor saved= doctorRepository.save(doctor);
        return DoctorMapper.mapToDoctorDto(saved);
    }

    @Override
    public DoctorDto updateDoctor(Long id, DoctorDto doctorDto)  {
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Doctor not found with id: " + id));

        if (doctorDto.getUsername() != null &&
                !doctorDto.getUsername().equals(existingDoctor.getUsername())) {
            if (doctorRepository.findByUsername(doctorDto.getUsername()).isPresent()) {
                throw new UserNameAlreadyExistException("Username already exists, choose another one");
            }
            existingDoctor.setUsername(doctorDto.getUsername());
        }
        if (doctorDto.getName() != null) {
            existingDoctor.setName(doctorDto.getName());
        }
        if (doctorDto.getEmail() != null) {
            existingDoctor.setEmail(doctorDto.getEmail());
        }
        if (doctorDto.getPhone() != null) {
            existingDoctor.setPhone(doctorDto.getPhone());
        }
        if (doctorDto.getAddress() != null) {
            existingDoctor.setAddress(doctorDto.getAddress());
        }
        if (doctorDto.getLicenseNumber() != null) {
            existingDoctor.setLicenseNumber(doctorDto.getLicenseNumber());
        }
        if (doctorDto.getSpecialization() != null) {
            existingDoctor.setSpecialization(doctorDto.getSpecialization()); //maybe make it unchanged in front?
        }
        if (doctorDto.getYearsOfExperience() != null) {
            existingDoctor.setYearsOfExperience(doctorDto.getYearsOfExperience());
        }
        if (doctorDto.getEmploymentStatus() != null) {
            existingDoctor.setEmploymentStatus(EmploymentStatus.valueOf(doctorDto.getEmploymentStatus().toUpperCase()));
        }
        if (doctorDto.getShift() != null) {
            existingDoctor.setShift(doctorDto.getShift());
        }

        existingDoctor.setUpdatedAt(LocalDateTime.now());

        Doctor savedDoctor = doctorRepository.save(existingDoctor);
        return DoctorMapper.mapToDoctorDto(savedDoctor);
    }


    @Override
    public void deleteDoctor(Long id) {
        Doctor doctor= doctorRepository.findById(id).orElseThrow(()->new UserNotFoundException("Doctor not found"));
        doctorRepository.delete(doctor);
    }

    @Override
    public List<DoctorDto> getDoctorByName(String name) {
        if(name== null || name.trim().isEmpty())
            return Collections.emptyList();
        return doctorRepository.findByNameContainingIgnoreCase(name.trim())
                .stream().map(DoctorMapper::mapToDoctorDto).toList();
    }

    @Override
    public DoctorDto getDoctorByNationalId(String nationalId) {
        if(nationalId == null || nationalId.trim().isEmpty())
            return null;
        Doctor doctor= doctorRepository.findByNationalId(nationalId).orElseThrow(()->new UserNotFoundException("Doctor not found"));
        return DoctorMapper.mapToDoctorDto(doctor);
    }

    @Override
    public List<DoctorDto> getDoctorByEmploymentStatus(String employmentStatus) {
        if (employmentStatus == null || employmentStatus.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            EmploymentStatus enumStatus = EmploymentStatus.valueOf(employmentStatus.toUpperCase());
            return doctorRepository.findByEmploymentStatus(enumStatus)
                    .stream()
                    .map(DoctorMapper::mapToDoctorDto)
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid employment status: " + employmentStatus);
        }
    }

    @Override
    public List<DoctorDto> getDoctorBySpecialization(String specialization) {
        if (specialization == null || specialization.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return doctorRepository.findBySpecializationContainingIgnoreCase(specialization.trim())
                .stream().map(DoctorMapper::mapToDoctorDto)
                .toList();
    }
    @Override
    public List<PatientDTO> getDoctorPatients(Long id){
        Doctor doctor= doctorRepository.findById(id).orElseThrow(()->new UserNotFoundException("Doctor not found"));
        if(doctor.getPatients() == null){
            return Collections.emptyList();
        }
        return doctor.getPatients().stream().map(PatientMapper::mapToPatientDto).toList();
    }
}
