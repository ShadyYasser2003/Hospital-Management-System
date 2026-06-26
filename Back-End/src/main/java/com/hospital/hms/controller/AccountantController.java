package com.hospital.hms.controller;

import com.hospital.hms.dto.AccountantDto;
import com.hospital.hms.service.AccountantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accountants")
@RequiredArgsConstructor
public class AccountantController {

    private final AccountantService accountantService;

    @PostMapping
    public ResponseEntity<AccountantDto> create(@RequestBody AccountantDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountantService.createAccountant(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountantDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(accountantService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<AccountantDto>> getAll() {
        return ResponseEntity.ok(accountantService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountantDto> update(@PathVariable Long id, @RequestBody AccountantDto dto) {
        return ResponseEntity.ok(accountantService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        accountantService.delete(id);
        return ResponseEntity.ok("Accountant deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<AccountantDto>> search(@RequestParam String name) {
        return ResponseEntity.ok(accountantService.searchByName(name));
    }
}
