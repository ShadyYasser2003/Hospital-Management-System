package com.hospital.hms.dto.authentication;

import com.hospital.hms.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {

    private String AccessToken;
    private String refreshToken;
    private String type = "Bearer";
    private UserDto user;
}
