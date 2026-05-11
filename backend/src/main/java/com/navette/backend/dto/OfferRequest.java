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

    @NotNull
    private Long companyId;

    @NotNull
    private Long shuttleId;

    @NotNull
    private Long departureCityId;

    @NotNull
    private Long arrivalCityId;

    @NotBlank
    private String title;

    @NotNull
    private LocalTime departureTime;

    @NotNull
    private LocalTime arrivalTime;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal price;

    @NotNull
    @Min(1)
    private Integer totalPlaces;

    private String description;
}