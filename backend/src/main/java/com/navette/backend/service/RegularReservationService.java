package com.navette.backend.service;

import com.navette.backend.dto.RegularReservationRequest;
import com.navette.backend.dto.RegularReservationResponse;
import com.navette.backend.entity.RegularReservation;
import com.navette.backend.entity.User;
import com.navette.backend.enums.RegularReservationStatus;
import com.navette.backend.repository.RegularReservationRepository;
import com.navette.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RegularReservationService {

    private final RegularReservationRepository regularReservationRepository;
    private final UserRepository userRepository;

    public RegularReservationService(
            RegularReservationRepository regularReservationRepository,
            UserRepository userRepository
    ) {
        this.regularReservationRepository = regularReservationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RegularReservationResponse create(RegularReservationRequest request) {
        validateRequest(request);

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RegularReservation reservation = new RegularReservation();
        reservation.setUser(user);
        reservation.setDepartureCity(request.getDepartureCity().trim());
        reservation.setArrivalCity(request.getArrivalCity().trim());
        reservation.setDesiredTime(request.getDesiredTime());
        reservation.setPeriod(request.getPeriod().trim());
        reservation.setStartDate(request.getStartDate());
        reservation.setEndDate(request.getEndDate());
        reservation.setSeats(request.getSeats());
        reservation.setNotes(request.getNotes());

        reservation.setHasWifi(Boolean.TRUE.equals(request.getHasWifi()));
        reservation.setHasAirConditioning(Boolean.TRUE.equals(request.getHasAirConditioning()));
        reservation.setHasUsbCharger(Boolean.TRUE.equals(request.getHasUsbCharger()));
        reservation.setAllowsLuggage(Boolean.TRUE.equals(request.getAllowsLuggage()));

        reservation.setStatus(RegularReservationStatus.PENDING);

        RegularReservation saved = regularReservationRepository.save(reservation);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RegularReservationResponse> getByUser(Long userId) {
        return regularReservationRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegularReservationResponse> getAll() {
        return regularReservationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegularReservationResponse> getByStatus(RegularReservationStatus status) {
        return regularReservationRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public RegularReservationResponse updateStatus(Long id, RegularReservationStatus status) {
        RegularReservation reservation = regularReservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regular reservation not found"));

        if (reservation.getStatus() == RegularReservationStatus.CANCELLED) {
            throw new RuntimeException("Cancelled regular reservation cannot be updated");
        }

        reservation.setStatus(status);

        return mapToResponse(regularReservationRepository.save(reservation));
    }

    @Transactional
    public void cancel(Long id) {
        RegularReservation reservation = regularReservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Regular reservation not found"));

        if (reservation.getStatus() == RegularReservationStatus.CANCELLED) {
            return;
        }

        reservation.setStatus(RegularReservationStatus.CANCELLED);
        regularReservationRepository.save(reservation);
    }

    private void validateRequest(RegularReservationRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }

        if (request.getDepartureCity() == null || request.getDepartureCity().trim().isEmpty()) {
            throw new RuntimeException("Departure city is required");
        }

        if (request.getArrivalCity() == null || request.getArrivalCity().trim().isEmpty()) {
            throw new RuntimeException("Arrival city is required");
        }

        if (request.getDepartureCity().trim().equalsIgnoreCase(request.getArrivalCity().trim())) {
            throw new RuntimeException("Departure city and arrival city cannot be the same");
        }

        if (request.getDesiredTime() == null) {
            throw new RuntimeException("Desired time is required");
        }

        if (request.getPeriod() == null || request.getPeriod().trim().isEmpty()) {
            throw new RuntimeException("Period is required");
        }

        if (request.getSeats() == null || request.getSeats() <= 0) {
            throw new RuntimeException("Seats must be at least 1");
        }

        if (
                request.getStartDate() != null &&
                        request.getEndDate() != null &&
                        request.getEndDate().isBefore(request.getStartDate())
        ) {
            throw new RuntimeException("End date cannot be before start date");
        }
    }

    private RegularReservationResponse mapToResponse(RegularReservation reservation) {
        User user = reservation.getUser();

        return new RegularReservationResponse(
                reservation.getId(),
                user.getId(),
                user.getEmail(),
                user.getFirstName() + " " + user.getLastName(),
                reservation.getDepartureCity(),
                reservation.getArrivalCity(),
                reservation.getDesiredTime(),
                reservation.getPeriod(),
                reservation.getStartDate(),
                reservation.getEndDate(),
                reservation.getSeats(),
                reservation.getNotes(),
                Boolean.TRUE.equals(reservation.getHasWifi()),
                Boolean.TRUE.equals(reservation.getHasAirConditioning()),
                Boolean.TRUE.equals(reservation.getHasUsbCharger()),
                Boolean.TRUE.equals(reservation.getAllowsLuggage()),
                reservation.getStatus()
        );
    }
}