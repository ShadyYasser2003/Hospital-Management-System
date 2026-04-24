package com.hospital.hms.service;

import com.hospital.hms.dto.authentication.LoginRequest;
import com.hospital.hms.dto.authentication.LoginResponse;
import com.hospital.hms.dto.UserDto;

import java.util.List;

public interface UserService {

    public LoginResponse login(LoginRequest request) throws Exception ;
    public UserDto getUserById(Long id ) ;
    public List<UserDto> getAllUsers() ;
    public List<UserDto> getUsersByRole(String role);
    public List<UserDto> searchUsers(String query);
    public UserDto createUser(UserDto userDTO);
    public UserDto updateUser(Long id, UserDto userDTO) ;
    public void deleteUser(Long id);
    public UserDto getCurrentUser(String username);
    public void changePassword(Long userId, String oldPassword, String newPassword);
    public void resetPassword(Long userId, String newPassword);
}
