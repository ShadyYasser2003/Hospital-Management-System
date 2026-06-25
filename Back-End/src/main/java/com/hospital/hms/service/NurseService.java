package com.hospital.hms.service;

import com.hospital.hms.dto.NurseDto;
import com.hospital.hms.dto.PatientDTO;

import java.util.List;

public interface NurseService {
    List<NurseDto> getAllNurses();
    NurseDto getNurseById(Long id);
    List<NurseDto> getNurseByName(String name);
    NurseDto getNurseByNationalId(String nationalId);
    NurseDto updateNurse(Long id, NurseDto nurseDto);
    void deleteNurse(Long id);
    NurseDto createNurse(NurseDto nurseDto);
    List<NurseDto> getNurseByEmploymentStatus(String status);
    List<NurseDto> getNurseBySpecialization(String specialization);
    List<PatientDTO> getNursePatients(Long id);
}
