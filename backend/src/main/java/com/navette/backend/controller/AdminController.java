package com.navette.backend.controller;

import com.navette.backend.dto.AdminStatsResponse;
import com.navette.backend.dto.AdminUserResponse;
import com.navette.backend.dto.CompanyStatusRequest;
import com.navette.backend.dto.UserStatusRequest;
import com.navette.backend.entity.Demand;
import com.navette.backend.entity.Offer;
import com.navette.backend.entity.TransportCompany;
import com.navette.backend.enums.CompanyStatus;
import com.navette.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getUsers();
    }

    @PutMapping("/users/{id}/status")
    public AdminUserResponse updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusRequest request
    ) {
        return adminService.updateUserStatus(id, request);
    }

    @GetMapping("/companies")
    public List<TransportCompany> getCompanies() {
        return adminService.getCompanies();
    }

    @GetMapping("/companies/pending")
    public List<TransportCompany> getPendingCompanies() {
        return adminService.getCompaniesByStatus(
                CompanyStatus.EN_ATTENTE
        );
    }

    @PutMapping("/companies/{id}/status")
    public TransportCompany updateCompanyStatus(
            @PathVariable Long id,
            @Valid @RequestBody CompanyStatusRequest request
    ) {
        return adminService.updateCompanyStatus(id, request);
    }

    @PutMapping("/companies/{id}/validate")
    public TransportCompany validateCompany(
            @PathVariable Long id
    ) {
        return adminService.validateCompany(id);
    }

    @PutMapping("/companies/{id}/reject")
    public TransportCompany rejectCompany(
            @PathVariable Long id
    ) {
        return adminService.rejectCompany(id);
    }

    @PutMapping("/companies/{id}/block")
    public TransportCompany blockCompany(
            @PathVariable Long id
    ) {
        return adminService.blockCompany(id);
    }

    @GetMapping("/offers")
    public List<Offer> getOffers() {
        return adminService.getOffers();
    }

    @GetMapping("/demands")
    public List<Demand> getDemands() {
        return adminService.getDemands();
    }

    @GetMapping("/reservations")
    public List<?> getReservations() {
        return adminService.getReservations();
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }
}
