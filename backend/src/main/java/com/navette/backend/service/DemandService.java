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

        Demand existingDemand = demandRepository
                .findByDepartureCityIdAndArrivalCityIdAndDesiredTimeAndPeriod(
                        request.getDepartureCityId(),
                        request.getArrivalCityId(),
                        request.getDesiredTime(),
                        request.getPeriod()
                )
                .orElse(null);

        if (existingDemand != null && existingDemand.getStatus() == DemandStatus.OUVERTE) {
            existingDemand.setInterestedCount(existingDemand.getInterestedCount() + 1);
            Demand updatedDemand = demandRepository.save(existingDemand);
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