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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final TransportCompanyRepository transportCompanyRepository;
    private final ShuttleRepository shuttleRepository;
    private final CityRepository cityRepository;

    @Transactional
    public OfferResponse createOffer(OfferRequest request) {
        TransportCompany company = transportCompanyRepository
                .findById(request.getCompanyId())
                .orElseThrow(() ->
                        new RuntimeException("Transport company not found")
                );

        Shuttle shuttle = shuttleRepository
                .findById(request.getShuttleId())
                .orElseThrow(() ->
                        new RuntimeException("Shuttle not found")
                );

        City departureCity = cityRepository
                .findById(request.getDepartureCityId())
                .orElseThrow(() ->
                        new RuntimeException("Departure city not found")
                );

        City arrivalCity = cityRepository
                .findById(request.getArrivalCityId())
                .orElseThrow(() ->
                        new RuntimeException("Arrival city not found")
                );

        if (!shuttle.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException(
                    "This shuttle does not belong to this company"
            );
        }

        if (request.getDepartureCityId()
                .equals(request.getArrivalCityId())) {
            throw new RuntimeException(
                    "Departure city and arrival city must be different"
            );
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException(
                    "End date must be after start date"
            );
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
                .ticketPrice(request.getTicketPrice())
                .totalPlaces(request.getTotalPlaces())
                .availablePlaces(request.getTotalPlaces())
                .description(request.getDescription())
                .status(OfferStatus.OUVERTE)
                .build();

        Offer savedOffer = offerRepository.save(offer);

        return mapToResponse(savedOffer);
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> getAllOpenOffers() {
        return offerRepository
                .findByStatus(OfferStatus.OUVERTE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> getCompanyOffers(Long companyId) {
        return offerRepository
                .findByCompanyId(companyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OfferResponse getOfferById(Long id) {
        Offer offer = offerRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Offer not found")
                );

        return mapToResponse(offer);
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> searchOffers(
            Long departureCityId,
            Long arrivalCityId
    ) {
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

    @Transactional
    public OfferResponse updateOffer(
            Long id,
            OfferRequest request
    ) {
        Offer offer = offerRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Offer not found")
                );

        if (offer.getStatus() == OfferStatus.ANNULEE) {
            throw new RuntimeException(
                    "A cancelled offer cannot be modified"
            );
        }

        if (offer.getStatus() == OfferStatus.EXPIREE) {
            throw new RuntimeException(
                    "An expired offer cannot be modified"
            );
        }

        TransportCompany company = transportCompanyRepository
                .findById(request.getCompanyId())
                .orElseThrow(() ->
                        new RuntimeException("Transport company not found")
                );

        if (!offer.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException(
                    "This offer does not belong to this company"
            );
        }

        Shuttle shuttle = shuttleRepository
                .findById(request.getShuttleId())
                .orElseThrow(() ->
                        new RuntimeException("Shuttle not found")
                );

        City departureCity = cityRepository
                .findById(request.getDepartureCityId())
                .orElseThrow(() ->
                        new RuntimeException("Departure city not found")
                );

        City arrivalCity = cityRepository
                .findById(request.getArrivalCityId())
                .orElseThrow(() ->
                        new RuntimeException("Arrival city not found")
                );

        if (!shuttle.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException(
                    "This shuttle does not belong to this company"
            );
        }

        if (request.getDepartureCityId()
                .equals(request.getArrivalCityId())) {
            throw new RuntimeException(
                    "Departure city and arrival city must be different"
            );
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException(
                    "End date must be after start date"
            );
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
        offer.setTicketPrice(request.getTicketPrice());
        offer.setTotalPlaces(request.getTotalPlaces());
        offer.setDescription(request.getDescription());

        if (
                offer.getAvailablePlaces() == null ||
                        offer.getAvailablePlaces() > request.getTotalPlaces()
        ) {
            offer.setAvailablePlaces(request.getTotalPlaces());
        }

        Offer updatedOffer = offerRepository.save(offer);

        return mapToResponse(updatedOffer);
    }

    @Transactional
    public OfferResponse cancelOffer(
            Long offerId,
            Long companyId
    ) {
        if (companyId == null) {
            throw new RuntimeException("Company ID is required");
        }

        Offer offer = offerRepository
                .findById(offerId)
                .orElseThrow(() ->
                        new RuntimeException("Offer not found")
                );

        if (!offer.getCompany().getId().equals(companyId)) {
            throw new RuntimeException(
                    "You cannot cancel an offer belonging to another company"
            );
        }

        if (offer.getStatus() == OfferStatus.ANNULEE) {
            throw new RuntimeException(
                    "This offer is already cancelled"
            );
        }

        if (offer.getStatus() != OfferStatus.OUVERTE) {
            throw new RuntimeException(
                    "Only an open offer can be cancelled"
            );
        }

        offer.setStatus(OfferStatus.ANNULEE);

        Offer cancelledOffer = offerRepository.save(offer);

        return mapToResponse(cancelledOffer);
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
                .ticketPrice(offer.getTicketPrice())
                .totalPlaces(offer.getTotalPlaces())
                .availablePlaces(offer.getAvailablePlaces())
                .status(offer.getStatus())
                .description(offer.getDescription())
                .build();
    }
}