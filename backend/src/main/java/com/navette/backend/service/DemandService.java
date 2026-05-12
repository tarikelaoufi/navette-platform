package com.navette.backend.service;

import com.navette.backend.dto.DemandRequest;
import com.navette.backend.dto.DemandResponse;
import com.navette.backend.entity.City;
import com.navette.backend.entity.Demand;
import com.navette.backend.entity.User;
import com.navette.backend.enums.DemandStatus;
import com.navette.backend.repository.CityRepository;
import com.navette.backend.repository.DemandRepository;
import com.navette.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/*
business rule: says there should be only one open demand for the same need.
Code logic
If no open demand exists:
    create new demand with interestedCount = 1
If one open demand exists:
    increment interestedCount + 1
If multiple open duplicate demands exist:
    merge all interestedCount into the first demand
    add +1 for the new request
    cancel the duplicate demands*/

@Service
@RequiredArgsConstructor
public class DemandService {

    private final DemandRepository demandRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;

    @Transactional
    public DemandResponse createDemand(DemandRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        City departureCity = cityRepository.findById(request.getDepartureCityId())
                .orElseThrow(() -> new RuntimeException("Departure city not found"));

        City arrivalCity = cityRepository.findById(request.getArrivalCityId())
                .orElseThrow(() -> new RuntimeException("Arrival city not found"));

        if (departureCity.getId().equals(arrivalCity.getId())) {
            throw new RuntimeException("Departure city and arrival city cannot be the same");
        }

        List<Demand> openDuplicates = demandRepository
                .findByDepartureCityIdAndArrivalCityIdAndDesiredTimeAndPeriodAndStatus(
                        request.getDepartureCityId(),
                        request.getArrivalCityId(),
                        request.getDesiredTime(),
                        request.getPeriod(),
                        DemandStatus.OUVERTE
                );

        if (!openDuplicates.isEmpty()) {
            Demand mainDemand = openDuplicates.get(0);

            int totalInterested = openDuplicates.stream()
                    .mapToInt(demand -> demand.getInterestedCount() == null ? 0 : demand.getInterestedCount())
                    .sum();

            mainDemand.setInterestedCount(totalInterested + 1);

            for (int i = 1; i < openDuplicates.size(); i++) {
                Demand duplicateDemand = openDuplicates.get(i);
                duplicateDemand.setStatus(DemandStatus.ANNULEE);
                demandRepository.save(duplicateDemand);
            }

            Demand updatedDemand = demandRepository.save(mainDemand);

            return mapToResponse(updatedDemand);
        }

        Demand demand = Demand.builder()
                .user(user)
                .departureCity(departureCity)
                .arrivalCity(arrivalCity)
                .desiredTime(request.getDesiredTime())
                .period(request.getPeriod())
                .interestedCount(1)
                .status(DemandStatus.OUVERTE)
                .build();

        Demand savedDemand = demandRepository.save(demand);

        return mapToResponse(savedDemand);
    }

    public List<DemandResponse> getUserDemands(Long userId) {
        return demandRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<DemandResponse> getOpenDemandsForCompanies() {
        return demandRepository.findByStatus(DemandStatus.OUVERTE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DemandResponse getDemandById(Long id) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demand not found"));

        return mapToResponse(demand);
    }

    public void cancelDemand(Long id) {
        Demand demand = demandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demand not found"));

        demand.setStatus(DemandStatus.ANNULEE);
        demandRepository.save(demand);
    }

    private DemandResponse mapToResponse(Demand demand) {
        User user = demand.getUser();

        return DemandResponse.builder()
                .id(demand.getId())
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userFullName(user.getFirstName() + " " + user.getLastName())
                .departureCityId(demand.getDepartureCity().getId())
                .departureCityName(demand.getDepartureCity().getName())
                .arrivalCityId(demand.getArrivalCity().getId())
                .arrivalCityName(demand.getArrivalCity().getName())
                .desiredTime(demand.getDesiredTime())
                .period(demand.getPeriod())
                .interestedCount(demand.getInterestedCount())
                .status(demand.getStatus())
                .createdAt(demand.getCreatedAt())
                .build();
    }
}