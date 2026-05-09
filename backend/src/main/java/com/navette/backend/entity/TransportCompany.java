package com.navette.backend.entity;

import com.navette.backend.enums.CompanyStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transport_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(nullable = false, unique = true, length = 150)
    private String professionalEmail;

    @Column(length = 30)
    private String phone;

    @Column(length = 255)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CompanyStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void beforeCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null) {
            status = CompanyStatus.EN_ATTENTE;
        }
    }
}