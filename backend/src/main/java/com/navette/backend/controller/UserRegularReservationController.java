package com.navette.backend.controller;

import com.navette.backend.dto.RegularReservationRequest;
import com.navette.backend.dto.RegularReservationResponse;
import com.navette.backend.service.RegularReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/regular-reservations")
public class UserRegularReservationController {

    private final RegularReservationService regularReservationService;

    public UserRegularReservationController(RegularReservationService regularReservationService) {
        this.regularReservationService = regularReservationService;
    }

    @PostMapping
    public ResponseEntity<RegularReservationResponse> create(
            @Valid @RequestBody RegularReservationRequest request
    ) {
        return ResponseEntity.ok(regularReservationService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<RegularReservationResponse>> getByUser(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(regularReservationService.getByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancel(@PathVariable Long id) {
        regularReservationService.cancel(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Regular reservation cancelled successfully");

        return ResponseEntity.ok(response);
    }
}