package com.navette.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReservationRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long offerId;

    @NotNull
    private LocalDate travelDate;
}