package com.navette.backend.controller;

import com.navette.backend.dto.OfferRequest;
import com.navette.backend.dto.OfferResponse;
import com.navette.backend.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @PostMapping("/api/company/offers")
    public OfferResponse createOffer(@Valid @RequestBody OfferRequest request) {
        return offerService.createOffer(request);
    }

    @GetMapping("/api/company/offers")
    public List<OfferResponse> getCompanyOffers(@RequestParam Long companyId) {
        return offerService.getCompanyOffers(companyId);
    }

    @GetMapping("/api/offers")
    public List<OfferResponse> getAllOpenOffers() {
        return offerService.getAllOpenOffers();
    }

    @GetMapping("/api/offers/search")
    public List<OfferResponse> searchOffers(
            @RequestParam Long departureCityId,
            @RequestParam Long arrivalCityId
    ) {
        return offerService.searchOffers(departureCityId, arrivalCityId);
    }

    @GetMapping("/api/offers/{id}")
    public OfferResponse getOfferById(@PathVariable Long id) {
        return offerService.getOfferById(id);
    }

    @PutMapping("/api/company/offers/{id}")
    public OfferResponse updateOffer(
            @PathVariable Long id,
            @Valid @RequestBody OfferRequest request
    ) {
        return offerService.updateOffer(id, request);
    }

    @DeleteMapping("/api/company/offers/{id}")
    public String deleteOffer(@PathVariable Long id) {
        offerService.deleteOffer(id);
        return "Offer deleted successfully";
    }
}