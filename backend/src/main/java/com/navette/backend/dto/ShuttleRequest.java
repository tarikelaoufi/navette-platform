package com.navette.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShuttleRequest {

    @NotNull
    private Long companyId;

    @NotBlank
    private String name;

    private String type;

    @NotNull
    @Min(1)
    private Integer capacity;

    private String description;
}