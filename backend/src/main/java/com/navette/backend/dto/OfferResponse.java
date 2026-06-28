package com.navette.backend.dto;

import com.navette.backend.enums.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class OfferResponse {

    private Long id;

    private Long companyId;
    private String companyName;

    private Long shuttleId;
    private String shuttleName;

    private Long departureCityId;
    private String departureCityName;

    private Long arrivalCityId;
    private String arrivalCityName;

    private String title;

    private LocalTime departureTime;
    private LocalTime arrivalTime;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal price;
    private BigDecimal ticketPrice;

    private Integer totalPlaces;
    private Integer availablePlaces;

    private OfferStatus status;

    private String description;
}