package com.navette.backend.entity;

import com.navette.backend.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    @Column(nullable = false)
    private LocalDateTime subscriptionDate;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SubscriptionStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @PrePersist
    public void beforeCreate() {
        if (subscriptionDate == null) {
            subscriptionDate = LocalDateTime.now();
        }

        if (status == null) {
            status = SubscriptionStatus.ACTIF;
        }
    }
}