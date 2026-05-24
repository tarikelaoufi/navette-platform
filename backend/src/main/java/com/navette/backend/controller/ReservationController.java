package com.navette.backend.controller;

import com.navette.backend.dto.ReservationRequest;
import com.navette.backend.dto.ReservationResponse;
import com.navette.backend.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/api/user/reservations")
    public ReservationResponse createReservation(@Valid @RequestBody ReservationRequest request) {
        return reservationService.createReservation(request);
    }

    @GetMapping("/api/user/reservations")
    public List<ReservationResponse> getUserReservations(@RequestParam Long userId) {
        return reservationService.getUserReservations(userId);
    }

    @GetMapping("/api/company/offers/{offerId}/reservations")
    public List<ReservationResponse> getOfferReservations(@PathVariable Long offerId) {
        return reservationService.getOfferReservations(offerId);
    }

    @GetMapping("/api/reservations/{id}")
    public ReservationResponse getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id);
    }

    @DeleteMapping("/api/user/reservations/{id}")
    public String cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id);
        return "Reservation cancelled successfully";
    }
}