package com.navette.backend.service;

import com.navette.backend.dto.AuthResponse;
import com.navette.backend.dto.LoginRequest;
import com.navette.backend.dto.RegisterCompanyRequest;
import com.navette.backend.dto.RegisterRequest;
import com.navette.backend.entity.Role;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.entity.User;
import com.navette.backend.enums.CompanyStatus;
import com.navette.backend.enums.RoleName;
import com.navette.backend.enums.UserStatus;
import com.navette.backend.repository.RoleRepository;
import com.navette.backend.repository.TransportCompanyRepository;
import com.navette.backend.repository.UserRepository;
import com.navette.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TransportCompanyRepository transportCompanyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role userRole = roleRepository
                .findByName(RoleName.ROLE_USER)
                .orElseThrow(() ->
                        new RuntimeException("ROLE_USER not found")
                );

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .phone(request.getPhone())
                .status(UserStatus.ACTIF)
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

    @Transactional
    public AuthResponse registerCompany(
            RegisterCompanyRequest request
    ) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (
                transportCompanyRepository
                        .existsByProfessionalEmail(
                                request.getProfessionalEmail()
                        )
        ) {
            throw new RuntimeException(
                    "Professional email already exists"
            );
        }

        Role companyRole = roleRepository
                .findByName(RoleName.ROLE_COMPANY)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ROLE_COMPANY not found"
                        )
                );

        /*
         * Le compte d'une nouvelle société reste en attente
         * jusqu'à la validation par l'administrateur.
         */
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .phone(request.getPhone())
                .status(UserStatus.EN_ATTENTE)
                .roles(Set.of(companyRole))
                .build();

        User savedUser = userRepository.save(user);

        TransportCompany company = TransportCompany.builder()
                .user(savedUser)
                .companyName(request.getCompanyName())
                .professionalEmail(
                        request.getProfessionalEmail()
                )
                .phone(request.getCompanyPhone())
                .address(request.getAddress())
                .status(CompanyStatus.EN_ATTENTE)
                .build();

        transportCompanyRepository.save(company);

        /*
         * Aucun token n'est créé avant la validation.
         * La société devra se connecter après validation.
         */
        return AuthResponse.builder()
                .token(null)
                .tokenType(null)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(RoleName.ROLE_COMPANY.name())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )
        ) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        if (user.getStatus() == UserStatus.EN_ATTENTE) {
            throw new RuntimeException(
                    "Votre compte est en attente de validation par l'administrateur."
            );
        }

        if (user.getStatus() == UserStatus.BLOQUE) {
            throw new RuntimeException(
                    "Votre compte est bloqué. Contactez l'administrateur."
            );
        }

        String role = user.getRoles()
                .stream()
                .map(roleEntity ->
                        roleEntity.getName().name()
                )
                .sorted()
                .findFirst()
                .orElse(RoleName.ROLE_USER.name());

        if (RoleName.ROLE_COMPANY.name().equals(role)) {
            TransportCompany company =
                    transportCompanyRepository
                            .findByUserId(user.getId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Société de transport introuvable."
                                    )
                            );

            if (
                    company.getStatus() ==
                            CompanyStatus.EN_ATTENTE
            ) {
                throw new RuntimeException(
                        "Votre demande de partenariat est en attente de validation."
                );
            }

            if (
                    company.getStatus() ==
                            CompanyStatus.REFUSEE
            ) {
                throw new RuntimeException(
                        "Votre demande de partenariat a été refusée."
                );
            }

            if (
                    company.getStatus() ==
                            CompanyStatus.BLOQUEE
            ) {
                throw new RuntimeException(
                        "Votre société est bloquée. Contactez l'administrateur."
                );
            }

            if (
                    company.getStatus() !=
                            CompanyStatus.VALIDEE
            ) {
                throw new RuntimeException(
                        "Votre société n'est pas autorisée à se connecter."
                );
            }
        }

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