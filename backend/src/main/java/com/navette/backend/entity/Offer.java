package com.navette.backend.entity;

import com.navette.backend.enums.OfferStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private TransportCompany company;

    @ManyToOne
    @JoinColumn(name = "shuttle_id", nullable = false)
    private Shuttle shuttle;

    @ManyToOne
    @JoinColumn(name = "departure_city_id", nullable = false)
    private City departureCity;

    @ManyToOne
    @JoinColumn(name = "arrival_city_id", nullable = false)
    private City arrivalCity;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false)
    private LocalTime departureTime;

    @Column(nullable = false)
    private LocalTime arrivalTime;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    /*
     * Prix abonnement / prix global de l'offre navette.
     * Exemple : 500 MAD.
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /*
     * Prix billet simple / aller simple.
     * Exemple : 25 MAD.
     */
    @Column(name = "ticket_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketPrice;

    @Column(nullable = false)
    private Integer totalPlaces;

    @Column(nullable = false)
    private Integer availablePlaces;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OfferStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @PrePersist
    public void beforeCreate() {
        if (status == null) {
            status = OfferStatus.OUVERTE;
        }

        if (availablePlaces == null && totalPlaces != null) {
            availablePlaces = totalPlaces;
        }

        if (ticketPrice == null) {
            ticketPrice = BigDecimal.ZERO;
        }
    }
}