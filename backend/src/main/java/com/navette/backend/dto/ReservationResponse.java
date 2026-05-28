package com.navette.backend.dto;

import com.navette.backend.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ReservationResponse {

    private Long id;

    private Long userId;
    private String userEmail;
    private String userFullName;

    private Long offerId;
    private String offerTitle;

    private String departureCityName;
    private String arrivalCityName;

    private LocalTime departureTime;
    private LocalTime arrivalTime;

    private String companyName;
    private String shuttleName;

    private LocalDate travelDate;
    private LocalDateTime reservationDate;

    private ReservationStatus status;
    private BigDecimal amount;
}