package com.hospital.hms.service;

import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.dto.PatientDTO;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface DoctorService {
    List<DoctorDto> getAllDoctors();
    DoctorDto getDoctorById(Long id);
    DoctorDto createDoctor(DoctorDto doctorDto);
    DoctorDto updateDoctor(Long id, DoctorDto doctorDto);
    void deleteDoctor(Long id);
    List<DoctorDto> getDoctorByName(String name);
    DoctorDto getDoctorByNationalId(String nationalId);
    List<DoctorDto> getDoctorByEmploymentStatus(String employmentStatus);
    List<DoctorDto> getDoctorBySpecialization(String specialization);
    List<PatientDTO> getDoctorPatients(Long id);
}
