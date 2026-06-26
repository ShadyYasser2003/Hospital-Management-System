package com.hospital.hms.service;

import com.hospital.hms.entity.RefreshToken;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(Long userId);
    RefreshToken verifyExpiration(RefreshToken token);
    void deleteByUserId(Long userId);
}
