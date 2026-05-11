package com.navette.backend.controller;

import com.navette.backend.dto.ShuttleRequest;
import com.navette.backend.dto.ShuttleResponse;
import com.navette.backend.service.ShuttleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company/shuttles")
@RequiredArgsConstructor
public class ShuttleController {

    private final ShuttleService shuttleService;

    @PostMapping
    public ShuttleResponse createShuttle(@Valid @RequestBody ShuttleRequest request) {
        return shuttleService.createShuttle(request);
    }

    @GetMapping
    public List<ShuttleResponse> getCompanyShuttles(@RequestParam Long companyId) {
        return shuttleService.getCompanyShuttles(companyId);
    }

    @GetMapping("/{id}")
    public ShuttleResponse getShuttleById(@PathVariable Long id) {
        return shuttleService.getShuttleById(id);
    }

    @PutMapping("/{id}")
    public ShuttleResponse updateShuttle(
            @PathVariable Long id,
            @Valid @RequestBody ShuttleRequest request
    ) {
        return shuttleService.updateShuttle(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteShuttle(@PathVariable Long id) {
        shuttleService.deleteShuttle(id);
        return "Shuttle deleted successfully";
    }
}