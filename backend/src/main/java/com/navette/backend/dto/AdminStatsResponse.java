package com.navette.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AdminStatsResponse {

    private long totalUsers;
    private long totalCompanies;
    private long totalCities;
    private long totalShuttles;
    private long totalOffers;
    private long totalSubscriptions;
    private long totalDemands;
}