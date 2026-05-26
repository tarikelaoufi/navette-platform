package com.navette.backend.controller;

import com.navette.backend.dto.RegularReservationResponse;
import com.navette.backend.enums.RegularReservationStatus;
import com.navette.backend.service.RegularReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company/regular-reservations")
public class CompanyRegularReservationController {

    private final RegularReservationService regularReservationService;

    public CompanyRegularReservationController(RegularReservationService regularReservationService) {
        this.regularReservationService = regularReservationService;
    }

    @GetMapping
    public ResponseEntity<List<RegularReservationResponse>> getAll(
            @RequestParam(required = false) RegularReservationStatus status
    ) {
        if (status != null) {
            return ResponseEntity.ok(regularReservationService.getByStatus(status));
        }

        return ResponseEntity.ok(regularReservationService.getAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<RegularReservationResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam RegularReservationStatus status
    ) {
        return ResponseEntity.ok(regularReservationService.updateStatus(id, status));
    }
}