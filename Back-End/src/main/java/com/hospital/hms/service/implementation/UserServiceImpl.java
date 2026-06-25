package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.UserRole;
import com.hospital.hms.Enum.UserStatus;
import com.hospital.hms.dto.authentication.LoginRequest;
import com.hospital.hms.dto.authentication.LoginResponse;
import com.hospital.hms.dto.UserDto;
import com.hospital.hms.entity.RefreshToken;
import com.hospital.hms.entity.User;
import com.hospital.hms.exception.InvalidPasswordException;
import com.hospital.hms.exception.PasswordEmptyException;
import com.hospital.hms.exception.UserNameAlreadyExistException;
import com.hospital.hms.exception.UserNotFoundException;
import com.hospital.hms.mapper.UserMapper;
import com.hospital.hms.repository.UserRepository;
import com.hospital.hms.service.RefreshTokenService;
import com.hospital.hms.service.UserService;
import com.hospital.hms.util.JwtUtil;
import lombok.AllArgsConstructor;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository ;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService ;

    @Override
    public LoginResponse login(LoginRequest request) throws Exception {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Invalid password");
        }

        if (user.getUserStatus() == UserStatus.INACTIVE) {
            throw new InvalidPasswordException("Account is deactivated. Contact administrator.");
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();

        String accessToken = jwtUtil.generateAccessToken(userDetails);


        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return LoginResponse.builder()
                .AccessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .type("Bearer")
                .user(UserMapper.mapToUserDto(user))
                .build();
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return UserMapper.mapToUserDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper ::mapToUserDto )
                .toList();
    }

    @Override
    public List<UserDto> getUsersByRole(String role) {
        UserRole userRole = UserRole.valueOf(role.toUpperCase());
        return userRepository.findByRole(userRole)
                .stream()
                .map(UserMapper::mapToUserDto)
                .toList();
    }

    @Override
    public List<UserDto> searchUsers(String query) {
        return userRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(UserMapper::mapToUserDto)
                .toList();
    }

    @Override
    public UserDto createUser(UserDto userDTO) {
        if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new UserNameAlreadyExistException("Username already exists");
        }
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setName(userDTO.getName());
        user.setPhone(userDTO.getPhone() != null ? userDTO.getPhone() : "");
        user.setNationalId(userDTO.getNationalId() != null ? userDTO.getNationalId() : "");
        user.setAddress(userDTO.getAddress() != null ? userDTO.getAddress() : "");
        user.setDateOfBirth(java.time.LocalDate.of(2000, 1, 1)); // default — user can update later
        // use provided password if present, otherwise default
        String rawPassword = (userDTO.getPassword() != null && !userDTO.getPassword().isBlank())
                ? userDTO.getPassword() : "changeme123";
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(UserRole.valueOf(userDTO.getRole().toUpperCase()));
        user.setUserStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);
        return UserMapper.mapToUserDto(savedUser);
    }

    @Override
    public UserDto updateUser(Long id, UserDto userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setAvatar(userDTO.getAvatar());

        User updatedUser = userRepository.save(user);
        UserDto userDto = UserMapper.mapToUserDto(updatedUser);

        return userDto ;
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserMapper.mapToUserDto(user);
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new InvalidPasswordException("Invalid old password");
        }

        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new PasswordEmptyException("New password cannot be empty");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

    }

    @Override
    public void resetPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public UserDto updateStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        try {
            user.setUserStatus(UserStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status + ". Must be ACTIVE or INACTIVE.");
        }
        return UserMapper.mapToUserDto(userRepository.save(user));
    }

}

