package com.navette.backend.service;

import com.navette.backend.dto.CompanyProfileUpdateRequest;
import com.navette.backend.dto.PasswordUpdateRequest;
import com.navette.backend.dto.ProfileResponse;
import com.navette.backend.dto.ProfileUpdateRequest;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.entity.User;
import com.navette.backend.repository.TransportCompanyRepository;
import com.navette.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final TransportCompanyRepository transportCompanyRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        User user = getUser(userId);

        TransportCompany company = transportCompanyRepository
                .findByUserId(userId)
                .orElse(null);

        return mapToResponse(user, company);
    }

    @Transactional
    public ProfileResponse updatePersonalInformation(
            Long userId,
            ProfileUpdateRequest request
    ) {
        User user = getUser(userId);

        String normalizedEmail = normalizeEmail(request.getEmail());

        userRepository.findByEmail(normalizedEmail)
                .filter(existingUser ->
                        !existingUser.getId().equals(userId)
                )
                .ifPresent(existingUser -> {
                    throw new IllegalArgumentException(
                            "Cette adresse email est déjà utilisée."
                    );
                });

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(normalizeOptionalText(request.getPhone()));

        User savedUser = userRepository.save(user);

        TransportCompany company = transportCompanyRepository
                .findByUserId(userId)
                .orElse(null);

        return mapToResponse(savedUser, company);
    }

    @Transactional
    public ProfileResponse updateCompanyInformation(
            Long userId,
            CompanyProfileUpdateRequest request
    ) {
        User user = getUser(userId);

        TransportCompany company = transportCompanyRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Aucune société n’est associée à ce compte."
                        )
                );

        String normalizedProfessionalEmail =
                normalizeEmail(request.getProfessionalEmail());

        boolean emailChanged =
                company.getProfessionalEmail() == null ||
                        !company.getProfessionalEmail()
                                .equalsIgnoreCase(normalizedProfessionalEmail);

        if (
                emailChanged &&
                        transportCompanyRepository
                                .existsByProfessionalEmail(
                                        normalizedProfessionalEmail
                                )
        ) {
            throw new IllegalArgumentException(
                    "Cet email professionnel est déjà utilisé."
            );
        }

        company.setCompanyName(
                request.getCompanyName().trim()
        );

        company.setProfessionalEmail(
                normalizedProfessionalEmail
        );

        company.setPhone(
                normalizeOptionalText(request.getPhone())
        );

        company.setAddress(
                normalizeOptionalText(request.getAddress())
        );

        TransportCompany savedCompany =
                transportCompanyRepository.save(company);

        return mapToResponse(user, savedCompany);
    }

    @Transactional
    public void updatePassword(
            Long userId,
            PasswordUpdateRequest request
    ) {
        User user = getUser(userId);

        if (
                !passwordEncoder.matches(
                        request.getCurrentPassword(),
                        user.getPassword()
                )
        ) {
            throw new IllegalArgumentException(
                    "Le mot de passe actuel est incorrect."
            );
        }

        if (
                !request.getNewPassword()
                        .equals(request.getConfirmPassword())
        ) {
            throw new IllegalArgumentException(
                    "La confirmation du nouveau mot de passe est incorrecte."
            );
        }

        if (
                passwordEncoder.matches(
                        request.getNewPassword(),
                        user.getPassword()
                )
        ) {
            throw new IllegalArgumentException(
                    "Le nouveau mot de passe doit être différent de l’ancien."
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);
    }

    private User getUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "L’identifiant de l’utilisateur est obligatoire."
            );
        }

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Utilisateur introuvable."
                        )
                );
    }

    private ProfileResponse mapToResponse(
            User user,
            TransportCompany company
    ) {
        String role = user.getRoles()
                .stream()
                .map(roleEntity ->
                        roleEntity.getName().name()
                )
                .sorted()
                .findFirst()
                .orElse(null);

        return ProfileResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(role)
                .status(user.getStatus())
                .companyId(
                        company != null
                                ? company.getId()
                                : null
                )
                .companyName(
                        company != null
                                ? company.getCompanyName()
                                : null
                )
                .professionalEmail(
                        company != null
                                ? company.getProfessionalEmail()
                                : null
                )
                .companyPhone(
                        company != null
                                ? company.getPhone()
                                : null
                )
                .address(
                        company != null
                                ? company.getAddress()
                                : null
                )
                .companyStatus(
                        company != null
                                ? company.getStatus()
                                : null
                )
                .build();
    }

    private String normalizeEmail(String email) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();

        return normalizedValue.isEmpty()
                ? null
                : normalizedValue;
    }
}
