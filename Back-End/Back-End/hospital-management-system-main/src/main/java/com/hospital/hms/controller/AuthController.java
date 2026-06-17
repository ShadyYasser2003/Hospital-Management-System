package com.hospital.hms.controller;

import com.hospital.hms.dto.UserDto;
import com.hospital.hms.dto.authentication.*;
import com.hospital.hms.entity.RefreshToken;
import com.hospital.hms.repository.RefreshTokenRepository;
import com.hospital.hms.service.RefreshTokenService;
import com.hospital.hms.service.UserService;
import com.hospital.hms.service.implementation.UserDetailsServiceImpl;
import com.hospital.hms.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    // ─── Login ────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) throws Exception {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    // ─── Refresh Token ────────────────────────────────────────────────────────
    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(
            @RequestBody RefreshTokenRequest request) {

        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token not found. Please log in again."));

        refreshTokenService.verifyExpiration(refreshToken);

        UserDetails userDetails = userDetailsService
                .loadUserByUsername(refreshToken.getUser().getUsername());

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);

        return ResponseEntity.ok(RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .type("Bearer")
                .build());
    }

    // ─── Get Current User ─────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDto user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    // ─── Logout ───────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserDto user = userService.getCurrentUser(userDetails.getUsername());
        refreshTokenService.deleteByUserId(user.getId());
        return ResponseEntity.ok("Logged out successfully");
    }

    // ─── Change Password ──────────────────────────────────────────────────────
    @PutMapping("/change-password/{id}")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request) {

        if (request.getOldPassword() == null || request.getOldPassword().isEmpty())
            return ResponseEntity.badRequest().body("Old password cannot be empty");
        if (request.getNewPassword() == null || request.getNewPassword().isEmpty())
            return ResponseEntity.badRequest().body("New password cannot be empty");

        try {
            userService.changePassword(id, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── Reset Password ───────────────────────────────────────────────────────
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<String> resetPassword(
            @PathVariable Long id,
            @RequestBody ResetPasswordRequest request) {

        if (request.getNewPassword() == null || request.getNewPassword().isEmpty())
            return ResponseEntity.badRequest().body("New password cannot be empty");

        try {
            userService.resetPassword(id, request.getNewPassword());
            return ResponseEntity.ok("Password reset successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
