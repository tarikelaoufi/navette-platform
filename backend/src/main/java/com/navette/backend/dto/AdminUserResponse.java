package com.navette.backend.dto;

import com.navette.backend.enums.CompanyStatus;
import com.navette.backend.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {

    private Long id;

    private String firstName;
    private String lastName;

    private String email;
    private String phone;

    /*
     * ROLE_USER, ROLE_COMPANY ou ROLE_ADMIN.
     */
    private String role;

    /*
     * Statut du compte utilisateur :
     * EN_ATTENTE, ACTIF ou BLOQUE.
     */
    private UserStatus status;

    /*
     * Ces champs sont remplis uniquement lorsque
     * l'utilisateur possède le rôle ROLE_COMPANY.
     */
    private Long companyId;
    private String companyName;
    private CompanyStatus companyStatus;
}