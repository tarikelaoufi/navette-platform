package com.navette.backend.service;

import com.navette.backend.dto.ReservationRequest;
import com.navette.backend.dto.ReservationResponse;
import com.navette.backend.entity.Offer;
import com.navette.backend.entity.Reservation;
import com.navette.backend.entity.User;
import com.navette.backend.enums.OfferStatus;
import com.navette.backend.enums.ReservationStatus;
import com.navette.backend.repository.OfferRepository;
import com.navette.backend.repository.ReservationRepository;
import com.navette.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Offer offer = offerRepository.findById(request.getOfferId())
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offer.getStatus() != OfferStatus.OUVERTE) {
            throw new RuntimeException("Offer is not open");
        }

        if (offer.getAvailablePlaces() == null || offer.getAvailablePlaces() <= 0) {
            offer.setStatus(OfferStatus.COMPLETE);
            offerRepository.save(offer);
            throw new RuntimeException("Offer is complete");
        }

        if (request.getTravelDate().isBefore(offer.getStartDate()) ||
                request.getTravelDate().isAfter(offer.getEndDate())) {
            throw new RuntimeException("Travel date must be between offer start date and end date");
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .offer(offer)
                .travelDate(request.getTravelDate())
                .status(ReservationStatus.CONFIRMEE)
                .amount(offer.getPrice())
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        offer.setAvailablePlaces(offer.getAvailablePlaces() - 1);

        if (offer.getAvailablePlaces() <= 0) {
            offer.setStatus(OfferStatus.COMPLETE);
        }

        offerRepository.save(offer);

        return mapToResponse(savedReservation);
    }

    public List<ReservationResponse> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ReservationResponse> getOfferReservations(Long offerId) {
        return reservationRepository.findByOfferId(offerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        return mapToResponse(reservation);
    }

    @Transactional
    public void cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.ANNULEE) {
            return;
        }

        reservation.setStatus(ReservationStatus.ANNULEE);
        reservationRepository.save(reservation);

        Offer offer = reservation.getOffer();

        if (offer != null) {
            offer.setAvailablePlaces(offer.getAvailablePlaces() + 1);

            if (offer.getStatus() == OfferStatus.COMPLETE) {
                offer.setStatus(OfferStatus.OUVERTE);
            }

            offerRepository.save(offer);
        }
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        User user = reservation.getUser();
        Offer offer = reservation.getOffer();

        return ReservationResponse.builder()
                .id(reservation.getId())
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userFullName(user.getFirstName() + " " + user.getLastName())
                .offerId(offer.getId())
                .offerTitle(offer.getTitle())
                .departureCityName(offer.getDepartureCity().getName())
                .arrivalCityName(offer.getArrivalCity().getName())
                .travelDate(reservation.getTravelDate())
                .reservationDate(reservation.getReservationDate())
                .status(reservation.getStatus())
                .amount(reservation.getAmount())
                .build();
    }
}