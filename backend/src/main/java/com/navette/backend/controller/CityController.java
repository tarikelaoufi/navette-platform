package com.navette.backend.controller;

import com.navette.backend.dto.CityRequest;
import com.navette.backend.dto.CityResponse;
import com.navette.backend.service.CityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    @GetMapping("/cities")
    public List<CityResponse> getAllCities() {
        return cityService.getAllCities();
    }

    @GetMapping("/cities/{id}")
    public CityResponse getCityById(@PathVariable Long id) {
        return cityService.getCityById(id);
    }

    @GetMapping("/cities/search")
    public List<CityResponse> searchCities(@RequestParam String name) {
        return cityService.searchCities(name);
    }

    @PostMapping("/admin/cities")
    public CityResponse createCity(@Valid @RequestBody CityRequest request) {
        return cityService.createCity(request);
    }

    @PutMapping("/admin/cities/{id}")
    public CityResponse updateCity(
            @PathVariable Long id,
            @Valid @RequestBody CityRequest request
    ) {
        return cityService.updateCity(id, request);
    }

    @DeleteMapping("/admin/cities/{id}")
    public String deleteCity(@PathVariable Long id) {
        cityService.deleteCity(id);
        return "City deleted successfully";
    }
}