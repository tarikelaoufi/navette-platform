package com.navette.backend.controller;

import com.navette.backend.dto.TransportCompanyResponse;
import com.navette.backend.service.TransportCompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/company")
public class CompanyController {

    private final TransportCompanyService transportCompanyService;

    @GetMapping("/me")
    public TransportCompanyResponse getCurrentCompany(@RequestParam Long userId) {
        return transportCompanyService.getCompanyByUserId(userId);
    }

    @GetMapping("/{companyId}")
    public TransportCompanyResponse getCompanyById(@PathVariable Long companyId) {
        return transportCompanyService.getCompanyById(companyId);
    }
}