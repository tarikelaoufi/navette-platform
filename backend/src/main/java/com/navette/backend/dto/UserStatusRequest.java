package com.navette.backend.dto;

import com.navette.backend.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStatusRequest {

    @NotNull(message = "Le statut de l'utilisateur est obligatoire.")
    private UserStatus status;
}