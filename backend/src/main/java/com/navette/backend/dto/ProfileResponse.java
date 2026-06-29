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
public class ProfileResponse {

    private Long userId;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    private String role;
    private UserStatus status;

    private Long companyId;
    private String companyName;
    private String professionalEmail;
    private String companyPhone;
    private String address;
    private CompanyStatus companyStatus;
}
