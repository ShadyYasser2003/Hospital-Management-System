package com.hospital.hms.service;

import com.hospital.hms.dto.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AdminService {
    //assign doctor or nurse to department
    NurseDto assignNurseToDep(Long nurseId, Long departmentId);
    DoctorDto assignDoctorToDep(Long doctorId, Long departmentId);
    PharmacistDto assignPharmacistToDep(Long pharmacistId, Long departmentId);
    //get all staff in a department
    List<UserDto> getAllStaffInDep(Long departmentId);
    PatientDTO transferPatientBetweenDepartments(Long newDepartmentId, Long oldDepartmentId, Long patientId);
    //transfer patients between departments
    PatientDTO addPatientToNewDepartment(Long departmentId, Long patientId);
    //assign patient to doctor
    PatientDTO assignPatientToDoctor(Long doctorId ,Long patientId);
    //get patient by department, status
    List<PatientDTO> getPatientByDepartment(Long departmentId);
    List<PatientDTO> getPatientByStatus(String patientStatus);

}
