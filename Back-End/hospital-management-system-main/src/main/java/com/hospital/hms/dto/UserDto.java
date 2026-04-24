package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class UserDto {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String nationalId;
    private String password;
    private String address;
    private String phone;
    private String role;
    private String avatar;
    private String status;
}
