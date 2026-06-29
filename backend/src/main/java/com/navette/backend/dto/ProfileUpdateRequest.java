package com.navette.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequest {

    @NotBlank(message = "Le prénom est obligatoire.")
    @Size(max = 100, message = "Le prénom ne doit pas dépasser 100 caractères.")
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire.")
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères.")
    private String lastName;

    @NotBlank(message = "L’adresse email est obligatoire.")
    @Email(message = "L’adresse email est invalide.")
    @Size(max = 150, message = "L’adresse email ne doit pas dépasser 150 caractères.")
    private String email;

    @Size(max = 30, message = "Le téléphone ne doit pas dépasser 30 caractères.")
    private String phone;
}
