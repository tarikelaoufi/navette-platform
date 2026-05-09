package com.navette.backend.repository;

import com.navette.backend.entity.Demand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalTime;
import java.util.Optional;

public interface DemandRepository extends JpaRepository<Demand, Long> {

    Optional<Demand> findByDepartureCityIdAndArrivalCityIdAndDesiredTimeAndPeriod(
            Long departureCityId,
            Long arrivalCityId,
            LocalTime desiredTime,
            String period
    );
}