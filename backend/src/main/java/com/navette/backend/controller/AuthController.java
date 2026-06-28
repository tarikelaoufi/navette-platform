package com.navette.backend.controller;

import com.navette.backend.dto.AuthResponse;
import com.navette.backend.dto.LoginRequest;
import com.navette.backend.dto.RegisterCompanyRequest;
import com.navette.backend.dto.RegisterRequest;
import com.navette.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Inscription d'un utilisateur simple.
     *
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse response = authService.register(request);

        return ResponseEntity.ok(response);
    }

    /**
     * Inscription d'une société de transport.
     *
     * POST /api/auth/register-company
     */
    @PostMapping("/register-company")
    public ResponseEntity<AuthResponse> registerCompany(
            @Valid @RequestBody RegisterCompanyRequest request
    ) {
        AuthResponse response = authService.registerCompany(request);

        return ResponseEntity.ok(response);
    }

    /**
     * Connexion utilisateur/société/admin.
     *
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
}