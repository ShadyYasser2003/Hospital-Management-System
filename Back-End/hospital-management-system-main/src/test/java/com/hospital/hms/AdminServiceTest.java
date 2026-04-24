package com.hospital.hms;
import com.hospital.hms.dto.UserDto;
import com.hospital.hms.entity.Department;

import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Nurse;
import com.hospital.hms.repository.DepartmentRepository;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.NurseRepository;
import com.hospital.hms.service.AdminService;
import org.assertj.core.util.Arrays;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private NurseRepository nurseRepository;

    @InjectMocks
    private AdminService adminService;

    private Long validDeptId = 1L;
    private Long invalidDeptId = 999L;

    @Test
    void getAllStaffInDep_ShouldReturnListOfUserDtos_WhenDepartmentExists() {
        // Arrange
        Department department = new Department();
        department.setId(validDeptId);
        department.setName("Cardiology");

        // Create test doctors
        Doctor doctor1 = new Doctor();
        doctor1.setId(101L);
        doctor1.setName("Dr. Smith");
        doctor1.setSpecialization("Cardiologist");

        Doctor doctor2 = new Doctor();
        doctor2.setId(102L);
        doctor2.setName("Dr. Johnson");
        doctor2.setSpecialization("Cardiologist");

        // Create test nurses
        Nurse nurse1 = new Nurse();
        nurse1.setId(201L);
        nurse1.setName("Nurse Alice");
        nurse1.setShift("MORNING");

        Nurse nurse2 = new Nurse();
        nurse2.setId(202L);
        nurse2.setName("Nurse Bob");
        nurse2.setShift("EVENING");

        List<Doctor> doctors = List.of(doctor1, doctor2);
        List<Nurse> nurses = List.of(nurse1, nurse2);

        // Mock repository calls
        when(departmentRepository.findById(validDeptId)).thenReturn(Optional.of(department));
        when(doctorRepository.findByDepartment(validDeptId)).thenReturn(doctors);
        when(nurseRepository.findByDepartment(validDeptId)).thenReturn(nurses);

        // Act
        List<UserDto> result = adminService.getAllStaffInDep(validDeptId);

        // Assert
        assertThat(result).isNotNull();
//        assertThat(result).(4); // 2 doctors + 2 nurses

        // Verify repository interactions
        verify(departmentRepository).findById(validDeptId);
        verify(doctorRepository).findByDepartment(validDeptId);
        verify(nurseRepository).findByDepartment(validDeptId);

        // Optional: Check content of UserDtos
        assertThat(result.get(0).getId()).isEqualTo(101L);
        assertThat(result.get(0).getName()).isEqualTo("Dr. Smith");
        assertThat(result.get(1).getId()).isEqualTo(102L);
        assertThat(result.get(2).getId()).isEqualTo(201L);
        assertThat(result.get(3).getId()).isEqualTo(202L);
    }

    @Test
    void getAllStaffInDep_ShouldReturnEmptyList_WhenDepartmentHasNoStaff() {
        // Arrange
        Department department = new Department();
        department.setId(validDeptId);

        when(departmentRepository.findById(validDeptId)).thenReturn(Optional.of(department));
        when(doctorRepository.findByDepartment(validDeptId)).thenReturn(Collections.emptyList());
        when(nurseRepository.findByDepartment(validDeptId)).thenReturn(Collections.emptyList());

        // Act
        List<UserDto> result = adminService.getAllStaffInDep(validDeptId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isNull();

        verify(departmentRepository).findById(validDeptId);
        verify(doctorRepository).findByDepartment(validDeptId);
        verify(nurseRepository).findByDepartment(validDeptId);
    }

    @Test
    void getAllStaffInDep_ShouldThrowException_WhenDepartmentDoesNotExist() {
        // Arrange
        when(departmentRepository.findById(invalidDeptId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> adminService.getAllStaffInDep(invalidDeptId));

        assertThat(exception.getMessage()).isEqualTo("No such department");

        // Verify only department repository was called
        verify(departmentRepository).findById(invalidDeptId);
        verify(doctorRepository, never()).findByDepartment(anyLong());
        verify(nurseRepository, never()).findByDepartment(anyLong());
    }

    @Test
    void getAllStaffInDep_ShouldReturnOnlyDoctors_WhenNoNursesInDepartment() {
        // Arrange
        Department department = new Department();
        department.setId(validDeptId);

        Doctor doctor = new Doctor();
        doctor.setId(101L);
        doctor.setName("Dr. Smith");

        List<Doctor> doctors = List.of(doctor);
        List<Nurse> nurses = Collections.emptyList();

        when(departmentRepository.findById(validDeptId)).thenReturn(Optional.of(department));
        when(doctorRepository.findByDepartment(validDeptId)).thenReturn(doctors);
        when(nurseRepository.findByDepartment(validDeptId)).thenReturn(nurses);

        // Act
        List<UserDto> result = adminService.getAllStaffInDep(validDeptId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSameClassAs(1);
        assertThat(result.get(0).getId()).isEqualTo(101L);

        verify(departmentRepository).findById(validDeptId);
        verify(doctorRepository).findByDepartment(validDeptId);
        verify(nurseRepository).findByDepartment(validDeptId);
    }

    @Test
    void getAllStaffInDep_ShouldReturnOnlyNurses_WhenNoDoctorsInDepartment() {
        // Arrange
        Department department = new Department();
        department.setId(validDeptId);

        Nurse nurse = new Nurse();
        nurse.setId(201L);
        nurse.setName("Nurse Alice");

        List<Doctor> doctors = Collections.emptyList();
        List<Nurse> nurses = List.of(nurse);

        when(departmentRepository.findById(validDeptId)).thenReturn(Optional.of(department));
        when(doctorRepository.findByDepartment(validDeptId)).thenReturn(doctors);
        when(nurseRepository.findByDepartment(validDeptId)).thenReturn(nurses);

        // Act
        List<UserDto> result = adminService.getAllStaffInDep(validDeptId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSameClassAs(1);
        assertThat(result.get(0).getId()).isEqualTo(201L);

        verify(departmentRepository).findById(validDeptId);
        verify(doctorRepository).findByDepartment(validDeptId);
        verify(nurseRepository).findByDepartment(validDeptId);
    }
}