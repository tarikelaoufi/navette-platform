package com.navette.backend.controller;

import com.navette.backend.dto.CompanyProfileUpdateRequest;
import com.navette.backend.dto.PasswordUpdateRequest;
import com.navette.backend.dto.ProfileResponse;
import com.navette.backend.dto.ProfileUpdateRequest;
import com.navette.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(
                profileService.getProfile(userId)
        );
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ProfileResponse> updatePersonalInformation(
            @PathVariable Long userId,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(
                profileService.updatePersonalInformation(
                        userId,
                        request
                )
        );
    }

    @PutMapping("/{userId}/company")
    public ResponseEntity<ProfileResponse> updateCompanyInformation(
            @PathVariable Long userId,
            @Valid @RequestBody CompanyProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(
                profileService.updateCompanyInformation(
                        userId,
                        request
                )
        );
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @PathVariable Long userId,
            @Valid @RequestBody PasswordUpdateRequest request
    ) {
        profileService.updatePassword(userId, request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Mot de passe modifié avec succès."
                )
        );
    }
}
