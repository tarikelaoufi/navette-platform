package com.navette.backend.entity;

import com.navette.backend.enums.DemandStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "demands")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Demand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "departure_city_id", nullable = false)
    private City departureCity;

    @ManyToOne
    @JoinColumn(name = "arrival_city_id", nullable = false)
    private City arrivalCity;

    @Column(nullable = false)
    private LocalTime desiredTime;

    @Column(nullable = false, length = 100)
    private String period;

    @Column(nullable = false)
    private Integer interestedCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DemandStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void beforeCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null) {
            status = DemandStatus.OUVERTE;
        }

        if (interestedCount == null) {
            interestedCount = 1;
        }
    }
}