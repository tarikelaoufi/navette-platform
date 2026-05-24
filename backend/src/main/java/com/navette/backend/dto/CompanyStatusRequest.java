package com.navette.backend.dto;

import com.navette.backend.enums.CompanyStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyStatusRequest {

    @NotNull
    private CompanyStatus status;
}