package com.navette.backend.repository;

import com.navette.backend.entity.Shuttle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShuttleRepository extends JpaRepository<Shuttle, Long> {

    List<Shuttle> findByCompanyId(Long companyId);
}