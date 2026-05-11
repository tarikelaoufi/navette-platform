package com.navette.backend.service;

import com.navette.backend.dto.OfferRequest;
import com.navette.backend.dto.OfferResponse;
import com.navette.backend.entity.City;
import com.navette.backend.entity.Offer;
import com.navette.backend.entity.Shuttle;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.enums.OfferStatus;
import com.navette.backend.repository.CityRepository;
import com.navette.backend.repository.OfferRepository;
import com.navette.backend.repository.ShuttleRepository;
import com.navette.backend.repository.TransportCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final TransportCompanyRepository transportCompanyRepository;
    private final ShuttleRepository shuttleRepository;
    private final CityRepository cityRepository;

    public OfferResponse createOffer(OfferRequest request) {
        TransportCompany company = transportCompanyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Transport company not found"));

        Shuttle shuttle = shuttleRepository.findById(request.getShuttleId())
                .orElseThrow(() -> new RuntimeException("Shuttle not found"));

        City departureCity = cityRepository.findById(request.getDepartureCityId())
                .orElseThrow(() -> new RuntimeException("Departure city not found"));

        City arrivalCity = cityRepository.findById(request.getArrivalCityId())
                .orElseThrow(() -> new RuntimeException("Arrival city not found"));

        if (!shuttle.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("This shuttle does not belong to this company");
        }

        Offer offer = Offer.builder()
                .company(company)
                .shuttle(shuttle)
                .departureCity(departureCity)
                .arrivalCity(arrivalCity)
                .title(request.getTitle())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .price(request.getPrice())
                .totalPlaces(request.getTotalPlaces())
                .availablePlaces(request.getTotalPlaces())
                .description(request.getDescription())
                .status(OfferStatus.OUVERTE)
                .build();

        Offer savedOffer = offerRepository.save(offer);

        return mapToResponse(savedOffer);
    }

    public List<OfferResponse> getAllOpenOffers() {
        return offerRepository.findByStatus(OfferStatus.OUVERTE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OfferResponse> getCompanyOffers(Long companyId) {
        return offerRepository.findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OfferResponse getOfferById(Long id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        return mapToResponse(offer);
    }

    public List<OfferResponse> searchOffers(Long departureCityId, Long arrivalCityId) {
        return offerRepository
                .findByDepartureCityIdAndArrivalCityIdAndStatus(
                        departureCityId,
                        arrivalCityId,
                        OfferStatus.OUVERTE
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OfferResponse updateOffer(Long id, OfferRequest request) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        TransportCompany company = transportCompanyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Transport company not found"));

        Shuttle shuttle = shuttleRepository.findById(request.getShuttleId())
                .orElseThrow(() -> new RuntimeException("Shuttle not found"));

        City departureCity = cityRepository.findById(request.getDepartureCityId())
                .orElseThrow(() -> new RuntimeException("Departure city not found"));

        City arrivalCity = cityRepository.findById(request.getArrivalCityId())
                .orElseThrow(() -> new RuntimeException("Arrival city not found"));

        if (!shuttle.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("This shuttle does not belong to this company");
        }

        offer.setCompany(company);
        offer.setShuttle(shuttle);
        offer.setDepartureCity(departureCity);
        offer.setArrivalCity(arrivalCity);
        offer.setTitle(request.getTitle());
        offer.setDepartureTime(request.getDepartureTime());
        offer.setArrivalTime(request.getArrivalTime());
        offer.setStartDate(request.getStartDate());
        offer.setEndDate(request.getEndDate());
        offer.setPrice(request.getPrice());
        offer.setTotalPlaces(request.getTotalPlaces());
        offer.setDescription(request.getDescription());

        if (offer.getAvailablePlaces() == null || offer.getAvailablePlaces() > request.getTotalPlaces()) {
            offer.setAvailablePlaces(request.getTotalPlaces());
        }

        Offer updatedOffer = offerRepository.save(offer);

        return mapToResponse(updatedOffer);
    }

    public void deleteOffer(Long id) {
        if (!offerRepository.existsById(id)) {
            throw new RuntimeException("Offer not found");
        }

        offerRepository.deleteById(id);
    }

    private OfferResponse mapToResponse(Offer offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .companyId(offer.getCompany().getId())
                .companyName(offer.getCompany().getCompanyName())
                .shuttleId(offer.getShuttle().getId())
                .shuttleName(offer.getShuttle().getName())
                .departureCityId(offer.getDepartureCity().getId())
                .departureCityName(offer.getDepartureCity().getName())
                .arrivalCityId(offer.getArrivalCity().getId())
                .arrivalCityName(offer.getArrivalCity().getName())
                .title(offer.getTitle())
                .departureTime(offer.getDepartureTime())
                .arrivalTime(offer.getArrivalTime())
                .startDate(offer.getStartDate())
                .endDate(offer.getEndDate())
                .price(offer.getPrice())
                .totalPlaces(offer.getTotalPlaces())
                .availablePlaces(offer.getAvailablePlaces())
                .status(offer.getStatus())
                .description(offer.getDescription())
                .build();
    }
}