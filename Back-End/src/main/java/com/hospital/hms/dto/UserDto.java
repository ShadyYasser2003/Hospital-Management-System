package com.hospital.hms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    @Pattern(
        regexp = "^[a-zA-Z0-9]([a-zA-Z0-9._]{1,28}[a-zA-Z0-9])?$",
        message = "Username must contain only letters, numbers, underscores, or dots, and must not start or end with a special character"
    )
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
    private String dateOfBirth;  // "yyyy-MM-dd" string
}
