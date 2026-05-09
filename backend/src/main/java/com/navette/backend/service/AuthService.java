package com.navette.backend.service;

import com.navette.backend.dto.AuthResponse;
import com.navette.backend.dto.LoginRequest;
import com.navette.backend.dto.RegisterCompanyRequest;
import com.navette.backend.dto.RegisterRequest;
import com.navette.backend.entity.Role;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.entity.User;
import com.navette.backend.enums.RoleName;
import com.navette.backend.repository.RoleRepository;
import com.navette.backend.repository.TransportCompanyRepository;
import com.navette.backend.repository.UserRepository;
import com.navette.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TransportCompanyRepository transportCompanyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(userRole))
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                RoleName.ROLE_USER.name()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(RoleName.ROLE_USER.name())
                .build();
    }

    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (transportCompanyRepository.existsByProfessionalEmail(request.getProfessionalEmail())) {
            throw new RuntimeException("Professional email already exists");
        }

        Role companyRole = roleRepository.findByName(RoleName.ROLE_COMPANY)
                .orElseThrow(() -> new RuntimeException("ROLE_COMPANY not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(companyRole))
                .build();

        User savedUser = userRepository.save(user);

        TransportCompany company = TransportCompany.builder()
                .user(savedUser)
                .companyName(request.getCompanyName())
                .professionalEmail(request.getProfessionalEmail())
                .phone(request.getCompanyPhone())
                .address(request.getAddress())
                .build();

        transportCompanyRepository.save(company);

        String token = jwtService.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                RoleName.ROLE_COMPANY.name()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(RoleName.ROLE_COMPANY.name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String role = user.getRoles()
                .stream()
                .findFirst()
                .map(roleEntity -> roleEntity.getName().name())
                .orElse(RoleName.ROLE_USER.name());

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                role
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(role)
                .build();
    }
}