package com.hospital.hms.service.implementation;

import com.hospital.hms.dto.DepartmentDto;
import com.hospital.hms.entity.Department;
import com.hospital.hms.mapper.DepartmentMapper;
import com.hospital.hms.repository.DepartmentRepository;
import com.hospital.hms.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository;


    @Override
    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        if (departmentDto.getName() == null || departmentDto.getName().isBlank()) {
            throw new RuntimeException("Department name is required");
        }
        departmentRepository.findByNameIgnoreCase(departmentDto.getName())
                .ifPresent(d -> { throw new RuntimeException("Name already used, please choose a different name"); });

        Department department = DepartmentMapper.mapToDepartment(departmentDto);
        department.setActive(true);
        Department savedDepartment = departmentRepository.save(department);
        return DepartmentMapper.mapToDepartmentDto(savedDepartment);
    }

    @Override
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        departmentRepository.delete(department);
    }

    @Override
    public DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (departmentDto.getName() != null
                && !departmentDto.getName().equalsIgnoreCase(existing.getName())) {
            departmentRepository.findByNameIgnoreCase(departmentDto.getName())
                    .ifPresent(d -> {
                        if (!d.getId().equals(id)) {
                            throw new RuntimeException("Name already used, please choose a different name");
                        }
                    });
            existing.setName(departmentDto.getName());
        }

        if (departmentDto.getDescription() != null) existing.setDescription(departmentDto.getDescription());
        if (departmentDto.getLocation() != null)    existing.setLocation(departmentDto.getLocation());
        if (departmentDto.getBudget() != null)       existing.setBudget(departmentDto.getBudget());
        // Sync active status — null means "not provided", so only update if explicitly sent
        if (departmentDto.getActive() != null) {
            existing.setActive(departmentDto.getActive());
        }
        // Always sync bed counts from the payload
        existing.setTotalBeds(departmentDto.getTotalBeds());
        existing.setAvailableBeds(departmentDto.getAvailableBeds());

        return DepartmentMapper.mapToDepartmentDto(departmentRepository.save(existing));
    }

    @Override
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        return DepartmentMapper.mapToDepartmentDto(department);
    }

    @Override
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(DepartmentMapper::mapToDepartmentDto).toList();
    }

    @Override
    public DepartmentDto getDepartmentByName(String name) {
        Department department = departmentRepository.findByNameContainingIgnoreCase(name)
                .orElseThrow(() -> new RuntimeException("Department not found, please check the name"));
        return DepartmentMapper.mapToDepartmentDto(department);
    }

    @Override
    public List<DepartmentDto> getDepartmentByStatus(boolean active) {
        return departmentRepository.findByActive(active)
                .stream().map(DepartmentMapper::mapToDepartmentDto).toList();
    }

}
