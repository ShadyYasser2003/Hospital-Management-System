package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.EmploymentStatus;
import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.AccountantDto;
import com.hospital.hms.entity.Accountant;
import com.hospital.hms.exception.NationalIDAlreadyExists;
import com.hospital.hms.exception.UserNameAlreadyExistException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.AccountantMapper;
import com.hospital.hms.repository.AccountantRepository;
import com.hospital.hms.repository.UserRepository;
import com.hospital.hms.service.AccountantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountantServiceImpl implements AccountantService {

    private final AccountantRepository accountantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AccountantDto createAccountant(AccountantDto dto) {
        if (userRepository.findByNationalId(dto.getNationalId()).isPresent())
            throw new NationalIDAlreadyExists("National ID already exists: " + dto.getNationalId());
        if (userRepository.findByUsername(dto.getUsername()).isPresent())
            throw new UserNameAlreadyExistException("Username already exists: " + dto.getUsername());

        Accountant a = new Accountant();
        a.setUsername(dto.getUsername());
        a.setName(dto.getName());
        a.setEmail(dto.getEmail());
        a.setNationalId(dto.getNationalId());
        a.setPassword(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "changeme123"));
        a.setPhone(dto.getPhone() != null ? dto.getPhone() : "");
        a.setAddress(dto.getAddress() != null ? dto.getAddress() : "N/A");
        a.setDateOfBirth(dto.getDateOfBirth() != null
                ? DateUtils.parse(dto.getDateOfBirth())
                : java.time.LocalDate.of(2000, 1, 1));
        a.setRole(UserRole.ACCOUNTANT);
        a.setUserStatus(UserStatus.ACTIVE);
        a.setEmployeeNumber(dto.getEmployeeNumber());
        a.setShift(dto.getShift());
        if (dto.getEmploymentStatus() != null) {
            try { a.setEmploymentStatus(EmploymentStatus.valueOf(dto.getEmploymentStatus().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }

        return AccountantMapper.mapToDto(accountantRepository.save(a));
    }

    @Override
    @Transactional(readOnly = true)
    public AccountantDto getById(Long id) {
        return AccountantMapper.mapToDto(
                accountantRepository.findById(id)
                        .orElseThrow(() -> new UserNotFoundException("Accountant not found: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountantDto> getAll() {
        return accountantRepository.findAll().stream()
                .map(AccountantMapper::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AccountantDto update(Long id, AccountantDto dto) {
        Accountant a = accountantRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Accountant not found: " + id));
        if (dto.getName() != null)           a.setName(dto.getName());
        if (dto.getEmail() != null)          a.setEmail(dto.getEmail());
        if (dto.getPhone() != null)          a.setPhone(dto.getPhone());
        if (dto.getAddress() != null)        a.setAddress(dto.getAddress());
        if (dto.getEmployeeNumber() != null) a.setEmployeeNumber(dto.getEmployeeNumber());
        if (dto.getShift() != null)          a.setShift(dto.getShift());
        if (dto.getEmploymentStatus() != null) {
            try { a.setEmploymentStatus(EmploymentStatus.valueOf(dto.getEmploymentStatus().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        return AccountantMapper.mapToDto(accountantRepository.save(a));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        accountantRepository.delete(
                accountantRepository.findById(id)
                        .orElseThrow(() -> new UserNotFoundException("Accountant not found: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountantDto> searchByName(String name) {
        return accountantRepository.findByNameContainingIgnoreCase(name).stream()
                .map(AccountantMapper::mapToDto).collect(Collectors.toList());
    }
}
