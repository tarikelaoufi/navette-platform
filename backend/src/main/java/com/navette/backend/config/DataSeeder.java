package com.navette.backend.config;

import com.navette.backend.entity.City;
import com.navette.backend.entity.Role;
import com.navette.backend.entity.User;
import com.navette.backend.enums.RoleName;
import com.navette.backend.enums.UserStatus;
import com.navette.backend.repository.CityRepository;
import com.navette.backend.repository.RoleRepository;
import com.navette.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedRoles();
        seedCities();
        seedAdmin();
    }

    private void seedRoles() {
        createRoleIfNotExists(RoleName.ROLE_USER);
        createRoleIfNotExists(RoleName.ROLE_COMPANY);
        createRoleIfNotExists(RoleName.ROLE_ADMIN);
    }

    private void createRoleIfNotExists(RoleName roleName) {
        roleRepository.findByName(roleName).orElseGet(() ->
                roleRepository.save(
                        Role.builder()
                                .name(roleName)
                                .build()
                )
        );
    }

    private void seedCities() {
        if (cityRepository.count() > 0) {
            return;
        }

        List<City> cities = List.of(
                City.builder().name("Tanger").country("Maroc").build(),
                City.builder().name("Tétouan").country("Maroc").build(),
                City.builder().name("Casablanca").country("Maroc").build(),
                City.builder().name("Rabat").country("Maroc").build(),
                City.builder().name("Fès").country("Maroc").build(),
                City.builder().name("Meknès").country("Maroc").build(),
                City.builder().name("Marrakech").country("Maroc").build(),
                City.builder().name("Agadir").country("Maroc").build(),
                City.builder().name("Oujda").country("Maroc").build(),
                City.builder().name("Kenitra").country("Maroc").build(),
                City.builder().name("El Jadida").country("Maroc").build(),
                City.builder().name("Nador").country("Maroc").build(),
                City.builder().name("Al Hoceima").country("Maroc").build(),
                City.builder().name("Chefchaouen").country("Maroc").build(),
                City.builder().name("Larache").country("Maroc").build()
        );

        cityRepository.saveAll(cities);
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

        User admin = User.builder()
                .firstName("Admin")
                .lastName("System")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .phone("0000000000")
                .status(UserStatus.ACTIF)
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(admin);
    }
}