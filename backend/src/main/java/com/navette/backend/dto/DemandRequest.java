package com.navette.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class DemandRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long departureCityId;

    @NotNull
    private Long arrivalCityId;

    @NotNull
    private LocalTime desiredTime;

    @NotBlank
    private String period;
}