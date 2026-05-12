package com.navette.backend.dto;

import com.navette.backend.enums.DemandStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class DemandResponse {

    private Long id;

    private Long userId;
    private String userEmail;
    private String userFullName;

    private Long departureCityId;
    private String departureCityName;

    private Long arrivalCityId;
    private String arrivalCityName;

    private LocalTime desiredTime;
    private String period;

    private Integer interestedCount;

    private DemandStatus status;
    private LocalDateTime createdAt;
}