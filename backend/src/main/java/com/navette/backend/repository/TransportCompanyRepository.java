package com.navette.backend.repository;

import com.navette.backend.entity.TransportCompany;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransportCompanyRepository extends JpaRepository<TransportCompany, Long> {

    Optional<TransportCompany> findByUserId(Long userId);

    Optional<TransportCompany> findByProfessionalEmail(String professionalEmail);

    boolean existsByUserId(Long userId);

    boolean existsByProfessionalEmail(String professionalEmail);
}