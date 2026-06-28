package com.navette.backend.service;

import com.navette.backend.dto.AdminStatsResponse;
import com.navette.backend.dto.CompanyStatusRequest;
import com.navette.backend.entity.Demand;
import com.navette.backend.entity.Offer;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.entity.User;
import com.navette.backend.enums.CompanyStatus;
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
    public List<User> getUsers() {
        return userRepository.findAll();
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
            Long id,
            CompanyStatusRequest request
    ) {
        if (request == null || request.getStatus() == null) {
            throw new IllegalArgumentException(
                    "Le nouveau statut de la société est obligatoire."
            );
        }

        return updateCompanyStatus(id, request.getStatus());
    }

    @Transactional
    public TransportCompany updateCompanyStatus(
            Long id,
            CompanyStatus status
    ) {
        if (id == null) {
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
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Société de transport introuvable."
                        )
                );

        company.setStatus(status);

        return transportCompanyRepository.save(company);
    }

    @Transactional
    public TransportCompany validateCompany(Long id) {
        return updateCompanyStatus(
                id,
                CompanyStatus.VALIDEE
        );
    }

    @Transactional
    public TransportCompany rejectCompany(Long id) {
        return updateCompanyStatus(
                id,
                CompanyStatus.REFUSEE
        );
    }

    @Transactional
    public TransportCompany blockCompany(Long id) {
        return updateCompanyStatus(
                id,
                CompanyStatus.BLOQUEE
        );
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
}