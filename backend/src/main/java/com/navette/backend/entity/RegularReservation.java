package com.navette.backend.entity;

import com.navette.backend.enums.RegularReservationStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "regular_reservations")
public class RegularReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User who created the regular reservation request
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Written city names, not city IDs
    @Column(nullable = false, length = 100)
    private String departureCity;

    @Column(nullable = false, length = 100)
    private String arrivalCity;

    @Column(nullable = false)
    private LocalTime desiredTime;

    @Column(nullable = false, length = 100)
    private String period;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false)
    private Integer seats;

    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RegularReservationStatus status;

    @PrePersist
    public void beforeCreate() {
        if (status == null) {
            status = RegularReservationStatus.PENDING;
        }

        if (seats == null) {
            seats = 1;
        }
    }

    public RegularReservation() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getDepartureCity() {
        return departureCity;
    }

    public String getArrivalCity() {
        return arrivalCity;
    }

    public LocalTime getDesiredTime() {
        return desiredTime;
    }

    public String getPeriod() {
        return period;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public Integer getSeats() {
        return seats;
    }

    public String getNotes() {
        return notes;
    }

    public RegularReservationStatus getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setDepartureCity(String departureCity) {
        this.departureCity = departureCity;
    }

    public void setArrivalCity(String arrivalCity) {
        this.arrivalCity = arrivalCity;
    }

    public void setDesiredTime(LocalTime desiredTime) {
        this.desiredTime = desiredTime;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setSeats(Integer seats) {
        this.seats = seats;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setStatus(RegularReservationStatus status) {
        this.status = status;
    }
}