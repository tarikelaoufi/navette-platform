package com.navette.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class OfferRequest {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotNull(message = "Shuttle ID is required")
    private Long shuttleId;

    @NotNull(message = "Departure city ID is required")
    private Long departureCityId;

    @NotNull(message = "Arrival city ID is required")
    private Long arrivalCityId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Departure time is required")
    private LocalTime departureTime;

    @NotNull(message = "Arrival time is required")
    private LocalTime arrivalTime;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    /*
     * Prix abonnement / prix global de l’offre navette.
     * Exemple : 500 MAD pour abonnement.
     */
    @NotNull(message = "Subscription price is required")
    @DecimalMin(value = "0.0", message = "Subscription price must be positive")
    private BigDecimal price;

    /*
     * Prix billet simple / aller simple.
     * Exemple : 25 MAD pour un billet.
     */
    @NotNull(message = "Ticket price is required")
    @DecimalMin(value = "0.0", message = "Ticket price must be positive")
    private BigDecimal ticketPrice;

    @NotNull(message = "Total places is required")
    @Min(value = 1, message = "Total places must be at least 1")
    private Integer totalPlaces;

    private String description;
}