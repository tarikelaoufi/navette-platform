package com.navette.backend.dto;

import com.navette.backend.enums.ShuttleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ShuttleResponse {

    private Long id;
    private Long companyId;
    private String companyName;

    private String name;
    private String type;
    private Integer capacity;
    private String description;

    private Boolean hasWifi;
    private Boolean hasAirConditioning;
    private Boolean hasUsbCharger;
    private Boolean allowsLuggage;

    private ShuttleStatus status;
}