package com.navette.backend.service;

import com.navette.backend.dto.AdminStatsResponse;
import com.navette.backend.dto.AdminUserResponse;
import com.navette.backend.dto.CompanyStatusRequest;
import com.navette.backend.dto.UserStatusRequest;
import com.navette.backend.entity.Demand;
import com.navette.backend.entity.Offer;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.entity.User;
import com.navette.backend.enums.CompanyStatus;
import com.navette.backend.enums.RoleName;
import com.navette.backend.enums.UserStatus;
import com.navette.backend.repository.CityRepository;
import com.navette.backend.repository.DemandRepository;
import com.navette.backend.repository.OfferRepository;
import com.navette.backend.repository.ReservationRepository;
import com.navette.backend.repository.ShuttleRepository;
import com.navette.backend.repository.SubscriptionRepository;
import com.navette.backend.repository.TransportCompanyRepository;
import com.navette.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TransportCompanyRepository transportCompanyRepository;
    private final CityRepository cityRepository;
    private final ShuttleRepository shuttleRepository;
    private final OfferRepository offerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ReservationRepository reservationRepository;
    private final DemandRepository demandRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        List<User> users = userRepository.findAll();
        List<TransportCompany> companies = transportCompanyRepository.findAll();

        Map<Long, TransportCompany> companyByUserId = companies.stream()
                .filter(company ->
                        company.getUser() != null &&
                                company.getUser().getId() != null
                )
                .collect(
                        Collectors.toMap(
                                company -> company.getUser().getId(),
                                Function.identity(),
                                (first, second) -> first
                        )
                );

        return users.stream()
                .map(user ->
                        mapUserToResponse(
                                user,
                                companyByUserId.get(user.getId())
                        )
                )
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TransportCompany> getCompanies() {
        return transportCompanyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TransportCompany> getCompaniesByStatus(
            CompanyStatus status
    ) {
        if (status == null) {
            throw new IllegalArgumentException(
                    "Le statut de la société est obligatoire."
            );
        }

        return transportCompanyRepository
                .findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public List<Offer> getOffers() {
        return offerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Demand> getDemands() {
        return demandRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<?> getReservations() {
        return reservationRepository.findAll();
    }

    @Transactional
    public TransportCompany updateCompanyStatus(
            Long companyId,
            CompanyStatusRequest request
    ) {
        if (request == null || request.getStatus() == null) {
            throw new IllegalArgumentException(
                    "Le nouveau statut de la société est obligatoire."
            );
        }

        return updateCompanyStatus(companyId, request.getStatus());
    }

    @Transactional
    public TransportCompany updateCompanyStatus(
            Long companyId,
            CompanyStatus status
    ) {
        if (companyId == null) {
            throw new IllegalArgumentException(
                    "L’identifiant de la société est obligatoire."
            );
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "Le nouveau statut de la société est obligatoire."
            );
        }

        TransportCompany company = transportCompanyRepository
                .findById(companyId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Société de transport introuvable."
                        )
                );

        User user = company.getUser();

        if (user == null) {
            throw new IllegalArgumentException(
                    "Le compte utilisateur associé à cette société est introuvable."
            );
        }

        company.setStatus(status);

        switch (status) {
            case EN_ATTENTE -> user.setStatus(UserStatus.EN_ATTENTE);
            case VALIDEE -> user.setStatus(UserStatus.ACTIF);
            case REFUSEE, BLOQUEE -> user.setStatus(UserStatus.BLOQUE);
        }

        userRepository.save(user);

        return transportCompanyRepository.save(company);
    }

    @Transactional
    public TransportCompany validateCompany(Long companyId) {
        return updateCompanyStatus(
                companyId,
                CompanyStatus.VALIDEE
        );
    }

    @Transactional
    public TransportCompany rejectCompany(Long companyId) {
        return updateCompanyStatus(
                companyId,
                CompanyStatus.REFUSEE
        );
    }

    @Transactional
    public TransportCompany blockCompany(Long companyId) {
        return updateCompanyStatus(
                companyId,
                CompanyStatus.BLOQUEE
        );
    }

    @Transactional
    public AdminUserResponse updateUserStatus(
            Long userId,
            UserStatusRequest request
    ) {
        if (request == null || request.getStatus() == null) {
            throw new IllegalArgumentException(
                    "Le nouveau statut de l’utilisateur est obligatoire."
            );
        }

        return updateUserStatus(userId, request.getStatus());
    }

    @Transactional
    public AdminUserResponse updateUserStatus(
            Long userId,
            UserStatus status
    ) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "L’identifiant de l’utilisateur est obligatoire."
            );
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "Le nouveau statut de l’utilisateur est obligatoire."
            );
        }

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Utilisateur introuvable."
                        )
                );

        boolean isAdmin = user.getRoles()
                .stream()
                .anyMatch(role ->
                        role.getName() == RoleName.ROLE_ADMIN
                );

        if (isAdmin) {
            throw new IllegalArgumentException(
                    "Le statut d’un administrateur ne peut pas être modifié."
            );
        }

        TransportCompany company = transportCompanyRepository
                .findByUserId(userId)
                .orElse(null);

        user.setStatus(status);

        if (company != null) {
            switch (status) {
                case EN_ATTENTE ->
                        company.setStatus(CompanyStatus.EN_ATTENTE);

                case ACTIF ->
                        company.setStatus(CompanyStatus.VALIDEE);

                case BLOQUE ->
                        company.setStatus(CompanyStatus.BLOQUEE);
            }

            transportCompanyRepository.save(company);
        }

        User savedUser = userRepository.save(user);

        return mapUserToResponse(savedUser, company);
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalCompanies(transportCompanyRepository.count())
                .totalCities(cityRepository.count())
                .totalShuttles(shuttleRepository.count())
                .totalOffers(offerRepository.count())
                .totalSubscriptions(subscriptionRepository.count())
                .totalReservations(reservationRepository.count())
                .totalDemands(demandRepository.count())
                .build();
    }

    private AdminUserResponse mapUserToResponse(
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

        return AdminUserResponse.builder()
                .id(user.getId())
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
                .companyStatus(
                        company != null
                                ? company.getStatus()
                                : null
                )
                .build();
    }
}
