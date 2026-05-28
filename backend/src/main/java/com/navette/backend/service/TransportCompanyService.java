package com.navette.backend.service;

import com.navette.backend.dto.TransportCompanyResponse;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.entity.User;
import com.navette.backend.repository.TransportCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransportCompanyService {

    private final TransportCompanyRepository transportCompanyRepository;

    @Transactional(readOnly = true)
    public TransportCompanyResponse getCompanyByUserId(Long userId) {
        TransportCompany company = transportCompanyRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Transport company not found for this user"));

        return mapToResponse(company);
    }

    @Transactional(readOnly = true)
    public TransportCompanyResponse getCompanyById(Long companyId) {
        TransportCompany company = transportCompanyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Transport company not found"));

        return mapToResponse(company);
    }

    private TransportCompanyResponse mapToResponse(TransportCompany company) {
        User user = company.getUser();

        String userFullName = "-";
        if (user != null) {
            String firstName = user.getFirstName() != null ? user.getFirstName() : "";
            String lastName = user.getLastName() != null ? user.getLastName() : "";
            userFullName = (firstName + " " + lastName).trim();

            if (userFullName.isBlank()) {
                userFullName = "-";
            }
        }

        return TransportCompanyResponse.builder()
                .id(company.getId())
                .userId(user != null ? user.getId() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .userFullName(userFullName)
                .companyName(company.getCompanyName())
                .professionalEmail(company.getProfessionalEmail())
                .phone(company.getPhone())
                .address(company.getAddress())
                .status(company.getStatus())
                .createdAt(company.getCreatedAt())
                .build();
    }
}