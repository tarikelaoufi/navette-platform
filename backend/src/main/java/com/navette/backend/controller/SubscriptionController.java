package com.navette.backend.controller;

import com.navette.backend.dto.SubscriptionRequest;
import com.navette.backend.dto.SubscriptionResponse;
import com.navette.backend.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/api/user/subscriptions")
    public SubscriptionResponse createSubscription(@Valid @RequestBody SubscriptionRequest request) {
        return subscriptionService.createSubscription(request);
    }

    @GetMapping("/api/user/subscriptions")
    public List<SubscriptionResponse> getUserSubscriptions(@RequestParam Long userId) {
        return subscriptionService.getUserSubscriptions(userId);
    }

    @GetMapping("/api/company/offers/{offerId}/subscriptions")
    public List<SubscriptionResponse> getOfferSubscriptions(@PathVariable Long offerId) {
        return subscriptionService.getOfferSubscriptions(offerId);
    }

    @DeleteMapping("/api/user/subscriptions/{id}")
    public String cancelSubscription(@PathVariable Long id) {
        subscriptionService.cancelSubscription(id);
        return "Subscription cancelled successfully";
    }
}