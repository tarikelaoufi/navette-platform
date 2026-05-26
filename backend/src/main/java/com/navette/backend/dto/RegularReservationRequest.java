package com.navette.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class RegularReservationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Departure city is required")
    private String departureCity;

    @NotBlank(message = "Arrival city is required")
    private String arrivalCity;

    @NotNull(message = "Desired time is required")
    private LocalTime desiredTime;

    @NotBlank(message = "Period is required")
    private String period;

    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @FutureOrPresent(message = "End date must be today or in the future")
    private LocalDate endDate;

    @NotNull(message = "Seats number is required")
    @Min(value = 1, message = "Seats must be at least 1")
    private Integer seats;

    private String notes;

    public Long getUserId() {
        return userId;
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

    public void setUserId(Long userId) {
        this.userId = userId;
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
}