package com.navette.backend.service;

import com.navette.backend.dto.SubscriptionRequest;
import com.navette.backend.dto.SubscriptionResponse;
import com.navette.backend.entity.Offer;
import com.navette.backend.entity.Subscription;
import com.navette.backend.entity.User;
import com.navette.backend.enums.OfferStatus;
import com.navette.backend.enums.SubscriptionStatus;
import com.navette.backend.repository.OfferRepository;
import com.navette.backend.repository.SubscriptionRepository;
import com.navette.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    /*
    Logic:

If offer.availablePlaces > 0:
    create subscription
    availablePlaces = availablePlaces - 1

If availablePlaces becomes 0:
    offer.status = COMPLETE

If no places:
    return error "Offer is complete"
    */

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;

    @Transactional
    public SubscriptionResponse createSubscription(SubscriptionRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Offer offer = offerRepository.findById(request.getOfferId())
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        if (offer.getStatus() != OfferStatus.OUVERTE) {
            throw new RuntimeException("Offer is not open");
        }

        if (offer.getAvailablePlaces() == null || offer.getAvailablePlaces() <= 0) {
            offer.setStatus(OfferStatus.COMPLETE);
            offerRepository.save(offer);
            throw new RuntimeException("Offer is complete");
        }

        Subscription subscription = Subscription.builder()
                .user(user)
                .offer(offer)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(SubscriptionStatus.ACTIF)
                .amount(offer.getPrice())
                .build();

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        offer.setAvailablePlaces(offer.getAvailablePlaces() - 1);

        if (offer.getAvailablePlaces() <= 0) {
            offer.setStatus(OfferStatus.COMPLETE);
        }

        offerRepository.save(offer);

        return mapToResponse(savedSubscription);
    }

    public List<SubscriptionResponse> getUserSubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<SubscriptionResponse> getOfferSubscriptions(Long offerId) {
        return subscriptionRepository.findByOfferId(offerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void cancelSubscription(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        if (subscription.getStatus() == SubscriptionStatus.ANNULE) {
            return;
        }

        subscription.setStatus(SubscriptionStatus.ANNULE);
        subscriptionRepository.save(subscription);

        Offer offer = subscription.getOffer();

        if (offer != null) {
            offer.setAvailablePlaces(offer.getAvailablePlaces() + 1);

            if (offer.getStatus() == OfferStatus.COMPLETE) {
                offer.setStatus(OfferStatus.OUVERTE);
            }

            offerRepository.save(offer);
        }
    }

    private SubscriptionResponse mapToResponse(Subscription subscription) {
        User user = subscription.getUser();
        Offer offer = subscription.getOffer();

        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userFullName(user.getFirstName() + " " + user.getLastName())
                .offerId(offer.getId())
                .offerTitle(offer.getTitle())
                .departureCityName(offer.getDepartureCity().getName())
                .arrivalCityName(offer.getArrivalCity().getName())
                .subscriptionDate(subscription.getSubscriptionDate())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .status(subscription.getStatus())
                .amount(subscription.getAmount())
                .build();
    }
}