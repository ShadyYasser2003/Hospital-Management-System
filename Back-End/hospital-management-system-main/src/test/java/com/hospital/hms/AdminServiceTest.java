package com.hospital.hms;

import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.dto.UserDto;
import com.hospital.hms.entity.Department;
import com.hospital.hms.entity.Doctor;
import com.hospital.hms.entity.Nurse;
import com.hospital.hms.repository.DepartmentRepository;
import com.hospital.hms.repository.DoctorRepository;
import com.hospital.hms.repository.NurseRepository;
import com.hospital.hms.repository.PatientRepository;
import com.hospital.hms.repository.PharmacistRepository;
import com.hospital.hms.service.implementation.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AdminServiceImpl.getAllStaffInDep().
 *
 * The implementation loads staff via the Department entity's collections
 * (department.getDoctors(), department.getNurses(), department.getPharmacists()),
 * NOT via separate repository queries — so we set up the Department object
 * directly instead of stubbing findByDepartment().
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private NurseRepository nurseRepository;

    @Mock
    private PatientRepository patientRepsotiry;

    @Mock
    private PharmacistRepository pharmacistRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private final Long validDeptId   = 1L;
    private final Long invalidDeptId = 999L;

    // ── helpers ──────────────────────────────────────────────────────────────

    private Doctor makeDoctor(Long id, String name) {
        Doctor d = new Doctor();
        d.setId(id);
        d.setName(name);
        d.setSpecialization("Cardiologist");
        d.setRole(UserRole.DOCTOR);
        d.setUserStatus(UserStatus.ACTIVE);
        return d;
    }

    private Nurse makeNurse(Long id, String name) {
        Nurse n = new Nurse();
        n.setId(id);
        n.setName(name);
        n.setShift("MORNING");
        n.setRole(UserRole.NURSE);
        n.setUserStatus(UserStatus.ACTIVE);
        return n;
    }

    private Department makeDepartment(Long id, List<Doctor> doctors, List<Nurse> nurses) {
        Department dept = new Department();
        dept.setId(id);
        dept.setName("Cardiology");
        dept.setDoctors(doctors != null ? new ArrayList<>(doctors) : new ArrayList<>());
        dept.setNurses(nurses  != null ? new ArrayList<>(nurses)  : new ArrayList<>());
        dept.setPharmacists(new ArrayList<>());
        return dept;
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getAllStaffInDep_ShouldReturnListOfUserDtos_WhenDepartmentExists() {
        Doctor doctor1 = makeDoctor(101L, "Dr. Smith");
        Doctor doctor2 = makeDoctor(102L, "Dr. Johnson");
        Nurse  nurse1  = makeNurse(201L, "Nurse Alice");
        Nurse  nurse2  = makeNurse(202L, "Nurse Bob");

        Department department = makeDepartment(validDeptId,
                List.of(doctor1, doctor2), List.of(nurse1, nurse2));

        when(departmentRepository.findById(validDeptId)).thenReturn(Optional.of(department));

        List<UserDto> result = adminService.getAllStaffInDep(validDeptId);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(4); // 2 doctors + 2 nurses

        assertThat(result.get(0).getId()).isEqualTo(101L);
        assertThat(result.get(0).getName()).isEqualTo("Dr. Smith");
        assertThat(result.get(1).getId()).isEqualTo(102L);
        assertThat(result.get(2).getId()).isEqualTo(201L);
        assertThat(result.get(3).getId()).isEqualTo(202L);

        verify(departmentRepository).findById(validDeptId);
    }

    @Test
    void getAllStaffInDep_ShouldReturnEmptyList_WhenDepartmentHasNoStaff() {
        Department department = makeDepartment(validDeptId,
                Collections.emptyList(), Collections.emptyList());

        when(departmentRepository.findById(validDeptId)).thenReturn(Optional.of(department));

        List<UserDto> result = adminService.getAllStaffInDep(validDeptId);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();

        verify(departmentRepository).findById(validDeptId);
    }

    @Test
    void getAllStaffInDep_ShouldThrowException_WhenDepartmentDoesNotExist() {
        when(departmentRepository.findById(invalidDeptId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> adminService.getAllStaffInDep(invalidDeptId));

        assertThat(exception.getMessage()).isEqualTo("No such department");

        verify(departmentRepository).findById(invalidDeptId);
        // Repository query methods should never be called when dept not found
        verify(doctorRepository, never()).findByDepartment(anyLong());
        verify(nurseRepository,  never()).findByDepartment(anyLong());
    }

    @Test
    void getAllStaffInDep_ShouldReturnOnlyDoctors_WhenNoNursesInDepartment() {
        Doctor doctor = makeDoctor(101L, "Dr. Smith");
        Department department = makeDepartment(validDeptId,
                List.of(doctor), Collections.emptyList());

        when(departmentRepository.findById(validDeptId)).thenReturn(Optional.of(department));

        List<UserDto> result = adminService.getAllStaffInDep(validDeptId);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(101L);
        assertThat(result.get(0).getName()).isEqualTo("Dr. Smith");

        verify(departmentRepository).findById(validDeptId);
    }

    @Test
    void getAllStaffInDep_ShouldReturnOnlyNurses_WhenNoDoctorsInDepartment() {
        Nurse nurse = makeNurse(201L, "Nurse Alice");
        Department department = makeDepartment(validDeptId,
                Collections.emptyList(), List.of(nurse));

        when(departmentRepository.findById(validDeptId)).thenReturn(Optional.of(department));

        List<UserDto> result = adminService.getAllStaffInDep(validDeptId);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(201L);
        assertThat(result.get(0).getName()).isEqualTo("Nurse Alice");

        verify(departmentRepository).findById(validDeptId);
    }
}
