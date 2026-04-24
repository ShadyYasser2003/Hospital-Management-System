package com.hospital.hms.controller;

import com.hospital.hms.dto.*;
import com.hospital.hms.dto.authentication.ChangePasswordRequest;
import com.hospital.hms.dto.authentication.LoginRequest;
import com.hospital.hms.dto.authentication.LoginResponse;
import com.hospital.hms.dto.authentication.ResetPasswordRequest;
import com.hospital.hms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) throws Exception {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(
            @RequestHeader("Authorization") String token) {
        // لاحقاً سنتحقق من الـ Token
        // الآن نتجاهله
        return ResponseEntity.ok(new UserDto());
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }

    @PutMapping("/change-password/{id}")
    public ResponseEntity<String> changePassword(@PathVariable Long id ,  @RequestBody ChangePasswordRequest request) {
        if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Old password cannot be empty");
        }

        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("New password cannot be empty");
        }

        if (request.getOldPassword() == null || request.getOldPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Old password cannot be empty");
        }

        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("New password cannot be empty");
        }
        try {
            userService.changePassword(id, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<String> resetPassword(
            @PathVariable Long id,
            @RequestBody ResetPasswordRequest request){

        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("New password cannot be empty");
        }

        try {
            userService.resetPassword(id, request.getNewPassword());
            return ResponseEntity.ok("Password reset successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
