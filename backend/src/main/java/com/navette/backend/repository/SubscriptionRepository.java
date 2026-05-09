package com.navette.backend.repository;

import com.navette.backend.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserId(Long userId);

    List<Subscription> findByOfferId(Long offerId);
}