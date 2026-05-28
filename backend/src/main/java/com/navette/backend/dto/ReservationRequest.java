package com.navette.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReservationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Offer ID is required")
    private Long offerId;

    @NotNull(message = "Travel date is required")
    @FutureOrPresent(message = "Travel date must be today or in the future")
    private LocalDate travelDate;
}