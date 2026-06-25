package com.hospital.hms.service.implementation;

import com.hospital.hms.dto.DoctorDto;
import com.hospital.hms.dto.NurseDto;
import com.hospital.hms.dto.SpecialityDto;
import com.hospital.hms.dto.UserDto;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Nurse;
import com.hospital.hms.entity.Speciality;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.DoctorMapper;
import com.hospital.hms.mapper.NurseMapper;
import com.hospital.hms.mapper.SpecialityMapper;
import com.hospital.hms.mapper.UserMapper;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.NurseRepository;
import com.hospital.hms.repository.SpecialityRepository;
import com.hospital.hms.service.SpecialityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class SpecialityServiceImpl implements SpecialityService {
    private final SpecialityRepository specialityRepository;
    private final DoctorRepository doctorRepository;
    private final NurseRepository nurseRepository;
    @Override
    public DoctorDto addDoctorToSpecialty(Long doctorId, Long specialityId){
        Doctor doctor= doctorRepository.findById(doctorId)
                .orElseThrow(()->new UserNotFoundException("Doctor not found"));
        Speciality speciality= specialityRepository.findById(specialityId)
                .orElseThrow(()->new RuntimeException("Speciality not found"));

        if(doctor.getSpeciality() != null){
            Speciality oldSpec= doctor.getSpeciality();
            if(oldSpec.getDoctors() != null){
                oldSpec.getDoctors().remove(doctor);
            }
        }
        doctor.setSpeciality(speciality);
        if(!speciality.getName().isEmpty()){
            doctor.setSpecialization(speciality.getName());
        }
        if(speciality.getDoctors() == null ){
            speciality.setDoctors(new ArrayList<>());
        }
        speciality.getDoctors().add(doctor);
        Doctor savedDoctor= doctorRepository.save(doctor);
        specialityRepository.save(speciality);
        return DoctorMapper.mapToDoctorDto(savedDoctor);
    }
    @Override
    public NurseDto addNurseToSpecialty(Long nurseId, Long specialityId){
        Nurse nurse= nurseRepository.findById(nurseId)
                .orElseThrow(()->new UserNotFoundException("Nurse not found"));
        Speciality speciality= specialityRepository.findById(specialityId)
                .orElseThrow(()->new RuntimeException("Speciality not found"));

        if(nurse.getSpeciality() != null){
            Speciality oldSpec= nurse.getSpeciality();
            if(oldSpec.getDoctors() != null){
                oldSpec.getNurses().remove(nurse);
            }
        }
        nurse.setSpeciality(speciality);
        if(!speciality.getName().isEmpty()){
            nurse.setSpecialization(speciality.getName());
        }
        if(speciality.getNurses() == null ){
            speciality.setNurses(new ArrayList<>());
        }
        speciality.getNurses().add(nurse);
        Nurse savedNurse= nurseRepository.save(nurse);
        specialityRepository.save(speciality);
        return NurseMapper.mapToNurseDto(savedNurse);
    }
    @Override
    public SpecialityDto createSpeciality(SpecialityDto specialityDto) {
        if (specialityDto.getName() == null || specialityDto.getName().trim().isEmpty()) {
            throw new RuntimeException("Speciality name is required");
        }if (specialityRepository.findByNameContainingIgnoreCase(specialityDto.getName()).isPresent()) {
            throw new RuntimeException("Speciality name '" + specialityDto.getName() + "' already exists");
        }
        Speciality speciality = SpecialityMapper.mapFromDto(specialityDto);
        if (speciality.getStatus() == null) {
            speciality.setStatus("Active");
        }

        return SpecialityMapper.mapToDto(specialityRepository.save(speciality));
    }
    @Override
    public SpecialityDto updateSpeciality(Long id, SpecialityDto specialityDto) {
        Speciality speciality = specialityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Speciality not found"));
        if (specialityDto.getName() != null && !specialityDto.getName().equals(speciality.getName())) {
            specialityRepository.findByNameContainingIgnoreCase(specialityDto.getName())
                    .ifPresent(s -> {
                        throw new RuntimeException("Speciality name '" + specialityDto.getName() + "' already exists");
                    });
            speciality.setName(specialityDto.getName());
        }
        if (specialityDto.getStatus() != null) {
            speciality.setStatus(specialityDto.getStatus());
        }
        if (specialityDto.getDescription() != null) {
            speciality.setDescription(specialityDto.getDescription());
        }

        return SpecialityMapper.mapToDto(specialityRepository.save(speciality));
    }
    @Override
    public SpecialityDto getSpecialityById(Long id) {
        Speciality speciality= specialityRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Speciality not found"));
        return SpecialityMapper.mapToDto(speciality);
    }
    @Override
    public SpecialityDto getSpecialityByName(String name) {
        Speciality speciality= specialityRepository.findByNameContainingIgnoreCase(name)
                .orElseThrow(()->new RuntimeException("Speciality not found"));
        return SpecialityMapper.mapToDto(speciality);
    }

    @Override
    public List<SpecialityDto> getAllSpecialities() {
        List<Speciality> specialities= specialityRepository.findAll();
        return specialities.stream().map(SpecialityMapper::mapToDto).toList();
    }

    @Override
    public void deleteSpeciality(Long id) {
        Speciality speciality= specialityRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Speciality not found"));
        specialityRepository.delete(speciality);
    }
    @Override
    public List<UserDto> getSpecialityStaff(String name){
        if(name.isEmpty()|| name.trim().isEmpty()){
            throw new RuntimeException("Invalid name: empty string");
        }
        Speciality speciality= specialityRepository.findByNameContainingIgnoreCase(name.trim().toLowerCase())
                .orElseThrow(()->new RuntimeException("No such Speciality"));
        List<UserDto> staff = new ArrayList<>();
        if (speciality.getDoctors() != null) {
            staff.addAll(speciality.getDoctors().stream()
                    .map(UserMapper::mapToUserDto)
                    .toList());
        }
        if (speciality.getNurses() != null) {
            staff.addAll(speciality.getNurses().stream()
                    .map(UserMapper::mapToUserDto)
                    .toList());
        }
        return staff;
    }
}
