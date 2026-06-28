package com.navette.backend.dto;

import com.navette.backend.enums.CompanyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class TransportCompanyResponse {

    private Long id;

    private Long userId;

    private String userEmail;

    private String userFullName;

    private String companyName;

    private String professionalEmail;

    private String phone;

    private String address;

    private CompanyStatus status;

    private LocalDateTime createdAt;
}