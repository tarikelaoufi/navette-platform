package com.navette.backend.repository;

import com.navette.backend.entity.Offer;
import com.navette.backend.enums.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByStatus(OfferStatus status);

    List<Offer> findByDepartureCityIdAndArrivalCityIdAndStatus(
            Long departureCityId,
            Long arrivalCityId,
            OfferStatus status
    );

    List<Offer> findByCompanyId(Long companyId);
}