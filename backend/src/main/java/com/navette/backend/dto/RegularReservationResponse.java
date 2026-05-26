package com.navette.backend.dto;

import com.navette.backend.enums.RegularReservationStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public class RegularReservationResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;

    private String departureCity;
    private String arrivalCity;
    private LocalTime desiredTime;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer seats;
    private String notes;
    private RegularReservationStatus status;

    public RegularReservationResponse(
            Long id,
            Long userId,
            String userEmail,
            String userFullName,
            String departureCity,
            String arrivalCity,
            LocalTime desiredTime,
            String period,
            LocalDate startDate,
            LocalDate endDate,
            Integer seats,
            String notes,
            RegularReservationStatus status
    ) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userFullName = userFullName;
        this.departureCity = departureCity;
        this.arrivalCity = arrivalCity;
        this.desiredTime = desiredTime;
        this.period = period;
        this.startDate = startDate;
        this.endDate = endDate;
        this.seats = seats;
        this.notes = notes;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getUserFullName() {
        return userFullName;
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
}