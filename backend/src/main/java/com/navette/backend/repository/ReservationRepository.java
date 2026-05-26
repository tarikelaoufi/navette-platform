package com.navette.backend.repository;

import com.navette.backend.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByOfferId(Long offerId);

    @Query("""
            SELECT r
            FROM Reservation r
            JOIN r.offer o
            WHERE o.company.id = :companyId
            ORDER BY r.reservationDate DESC
            """)
    List<Reservation> findByCompanyId(@Param("companyId") Long companyId);
}