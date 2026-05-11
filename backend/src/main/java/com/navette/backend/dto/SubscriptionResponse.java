package com.navette.backend.dto;

import com.navette.backend.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class SubscriptionResponse {

    private Long id;

    private Long userId;
    private String userEmail;
    private String userFullName;

    private Long offerId;
    private String offerTitle;

    private String departureCityName;
    private String arrivalCityName;

    private LocalDateTime subscriptionDate;
    private LocalDate startDate;
    private LocalDate endDate;

    private SubscriptionStatus status;
    private BigDecimal amount;
}