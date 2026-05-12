package com.navette.backend.controller;

import com.navette.backend.dto.DemandRequest;
import com.navette.backend.dto.DemandResponse;
import com.navette.backend.service.DemandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DemandController {

    private final DemandService demandService;

    @PostMapping("/api/user/demands")
    public DemandResponse createDemand(@Valid @RequestBody DemandRequest request) {
        return demandService.createDemand(request);
    }

    @GetMapping("/api/user/demands")
    public List<DemandResponse> getUserDemands(@RequestParam Long userId) {
        return demandService.getUserDemands(userId);
    }

    @GetMapping("/api/company/demands")
    public List<DemandResponse> getOpenDemandsForCompanies() {
        return demandService.getOpenDemandsForCompanies();
    }

    @GetMapping("/api/demands/{id}")
    public DemandResponse getDemandById(@PathVariable Long id) {
        return demandService.getDemandById(id);
    }

    @DeleteMapping("/api/user/demands/{id}")
    public String cancelDemand(@PathVariable Long id) {
        demandService.cancelDemand(id);
        return "Demand cancelled successfully";
    }
}