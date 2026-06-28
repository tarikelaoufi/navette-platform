package com.navette.backend.controller;

import com.navette.backend.dto.TransportCompanyResponse;
import com.navette.backend.service.TransportCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {

    private final TransportCompanyService transportCompanyService;

    @GetMapping("/me")
    public ResponseEntity<TransportCompanyResponse> getCurrentCompany(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(
                transportCompanyService.getCompanyByUserId(userId)
        );
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<TransportCompanyResponse> getCompanyById(
            @PathVariable Long companyId
    ) {
        return ResponseEntity.ok(
                transportCompanyService.getCompanyById(companyId)
        );
    }
}