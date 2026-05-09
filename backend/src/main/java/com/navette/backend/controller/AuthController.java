package com.navette.backend.controller;

import com.navette.backend.dto.AuthResponse;
import com.navette.backend.dto.LoginRequest;
import com.navette.backend.dto.RegisterCompanyRequest;
import com.navette.backend.dto.RegisterRequest;
import com.navette.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/register-company")
    public AuthResponse registerCompany(@Valid @RequestBody RegisterCompanyRequest request) {
        return authService.registerCompany(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}