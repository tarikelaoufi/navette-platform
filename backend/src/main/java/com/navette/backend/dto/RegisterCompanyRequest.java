package com.navette.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterCompanyRequest {

    @NotBlank(message = "Le prénom du responsable est obligatoire.")
    private String firstName;

    @NotBlank(message = "Le nom du responsable est obligatoire.")
    private String lastName;

    @NotBlank(message = "Le nom de la société est obligatoire.")
    private String companyName;

    @NotBlank(message = "L’email professionnel est obligatoire.")
    @Email(message = "L’email professionnel est invalide.")
    private String professionalEmail;

    @NotBlank(message = "Le téléphone de la société est obligatoire.")
    private String phone;

    @NotBlank(message = "L’adresse de la société est obligatoire.")
    private String address;

    @NotBlank(message = "Le mot de passe est obligatoire.")
    @Size(
            min = 6,
            message = "Le mot de passe doit contenir au moins 6 caractères."
    )
    private String password;

    /**
     * Compatibilité avec AuthService qui utilise request.getEmail().
     */
    public String getEmail() {
        return professionalEmail;
    }

    /**
     * Compatibilité avec AuthService qui utilise
     * request.getCompanyPhone().
     */
    public String getCompanyPhone() {
        return phone;
    }
}