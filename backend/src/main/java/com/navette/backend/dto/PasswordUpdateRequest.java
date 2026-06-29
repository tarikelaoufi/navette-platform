package com.navette.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordUpdateRequest {

    @NotBlank(message = "Le mot de passe actuel est obligatoire.")
    private String currentPassword;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire.")
    @Size(min = 6, message = "Le nouveau mot de passe doit contenir au moins 6 caractères.")
    private String newPassword;

    @NotBlank(message = "La confirmation du mot de passe est obligatoire.")
    private String confirmPassword;
}
