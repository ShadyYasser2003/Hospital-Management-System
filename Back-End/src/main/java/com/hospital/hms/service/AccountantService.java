package com.hospital.hms.service;

import com.hospital.hms.dto.AccountantDto;

import java.util.List;

public interface AccountantService {
    AccountantDto createAccountant(AccountantDto dto);
    AccountantDto getById(Long id);
    List<AccountantDto> getAll();
    AccountantDto update(Long id, AccountantDto dto);
    void delete(Long id);
    List<AccountantDto> searchByName(String name);
}
