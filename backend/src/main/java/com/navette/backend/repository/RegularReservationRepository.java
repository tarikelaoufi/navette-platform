package com.navette.backend.repository;

import com.navette.backend.entity.RegularReservation;
import com.navette.backend.enums.RegularReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegularReservationRepository extends JpaRepository<RegularReservation, Long> {

    List<RegularReservation> findByUserId(Long userId);

    List<RegularReservation> findByStatus(RegularReservationStatus status);
}