package com.navette.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterCompanyRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String phone;

    @NotBlank
    private String companyName;

    @Email
    @NotBlank
    private String professionalEmail;

    private String companyPhone;

    private String address;
}