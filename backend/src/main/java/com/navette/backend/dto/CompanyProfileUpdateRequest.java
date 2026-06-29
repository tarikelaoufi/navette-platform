package com.navette.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyProfileUpdateRequest {

    @NotBlank(message = "Le nom de la société est obligatoire.")
    @Size(max = 150, message = "Le nom de la société ne doit pas dépasser 150 caractères.")
    private String companyName;

    @NotBlank(message = "L’email professionnel est obligatoire.")
    @Email(message = "L’email professionnel est invalide.")
    @Size(max = 150, message = "L’email professionnel ne doit pas dépasser 150 caractères.")
    private String professionalEmail;

    @Size(max = 30, message = "Le téléphone de la société ne doit pas dépasser 30 caractères.")
    private String phone;

    @Size(max = 255, message = "L’adresse ne doit pas dépasser 255 caractères.")
    private String address;
}
