package com.navette.backend.service;

import com.navette.backend.dto.AdminStatsResponse;
import com.navette.backend.dto.CompanyStatusRequest;
import com.navette.backend.entity.Demand;
import com.navette.backend.entity.Offer;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.entity.User;
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

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public List<TransportCompany> getCompanies() {
        return transportCompanyRepository.findAll();
    }

    public List<Offer> getOffers() {
        return offerRepository.findAll();
    }

    public List<Demand> getDemands() {
        return demandRepository.findAll();
    }

    public TransportCompany updateCompanyStatus(Long id, CompanyStatusRequest request) {
        TransportCompany company = transportCompanyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport company not found"));

        company.setStatus(request.getStatus());

        return transportCompanyRepository.save(company);
    }

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