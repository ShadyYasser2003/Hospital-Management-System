package com.hospital.hms.service;

import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.dto.NurseDto;
import com.hospital.hms.dto.SpecialityDto;
import com.hospital.hms.dto.UserDto;

import java.util.List;

public interface SpecialityService {
    SpecialityDto createSpeciality(SpecialityDto speciality);
    SpecialityDto updateSpeciality(Long id, SpecialityDto specialityDto);
    SpecialityDto getSpecialityById(Long id);
    SpecialityDto getSpecialityByName(String name);
    List<UserDto> getSpecialityStaff(String name);
    DoctorDto addDoctorToSpecialty(Long doctorId, Long specialityId);
    NurseDto addNurseToSpecialty(Long nurseId, Long specialityId);
    List<SpecialityDto> getAllSpecialities();
    void deleteSpeciality(Long id);
}
