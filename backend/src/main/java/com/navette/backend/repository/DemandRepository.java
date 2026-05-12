package com.navette.backend.repository;

import com.navette.backend.entity.Demand;
import com.navette.backend.enums.DemandStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalTime;
import java.util.List;

public interface DemandRepository extends JpaRepository<Demand, Long> {

    List<Demand> findByDepartureCityIdAndArrivalCityIdAndDesiredTimeAndPeriodAndStatus(
            Long departureCityId,
            Long arrivalCityId,
            LocalTime desiredTime,
            String period,
            DemandStatus status
    );

    List<Demand> findByUserId(Long userId);

    List<Demand> findByStatus(DemandStatus status);
}