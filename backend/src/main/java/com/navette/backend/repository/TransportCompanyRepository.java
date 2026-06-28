package com.navette.backend.repository;

import com.navette.backend.entity.TransportCompany;
import com.navette.backend.enums.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransportCompanyRepository
        extends JpaRepository<TransportCompany, Long> {

    Optional<TransportCompany> findByUserId(Long userId);

    Optional<TransportCompany> findByProfessionalEmail(
            String professionalEmail
    );

    boolean existsByUserId(Long userId);

    boolean existsByProfessionalEmail(String professionalEmail);

    List<TransportCompany> findByStatusOrderByCreatedAtDesc(
            CompanyStatus status
    );
}