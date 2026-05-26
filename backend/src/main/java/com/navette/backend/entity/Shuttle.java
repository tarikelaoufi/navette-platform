package com.navette.backend.entity;

import com.navette.backend.enums.ShuttleStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shuttles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shuttle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private TransportCompany company;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 80)
    private String type;

    @Column(nullable = false)
    private Integer capacity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean hasWifi;

    @Column(nullable = false)
    private Boolean hasAirConditioning;

    @Column(nullable = false)
    private Boolean hasUsbCharger;

    @Column(nullable = false)
    private Boolean allowsLuggage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShuttleStatus status;

    @PrePersist
    public void beforeCreate() {
        if (status == null) {
            status = ShuttleStatus.ACTIVE;
        }

        if (hasWifi == null) {
            hasWifi = false;
        }

        if (hasAirConditioning == null) {
            hasAirConditioning = false;
        }

        if (hasUsbCharger == null) {
            hasUsbCharger = false;
        }

        if (allowsLuggage == null) {
            allowsLuggage = false;
        }
    }

    @PreUpdate
    public void beforeUpdate() {
        if (hasWifi == null) {
            hasWifi = false;
        }

        if (hasAirConditioning == null) {
            hasAirConditioning = false;
        }

        if (hasUsbCharger == null) {
            hasUsbCharger = false;
        }

        if (allowsLuggage == null) {
            allowsLuggage = false;
        }
    }
}