package com.navette.backend.config;

import com.navette.backend.entity.City;
import com.navette.backend.entity.Role;
import com.navette.backend.enums.RoleName;
import com.navette.backend.repository.CityRepository;
import com.navette.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final CityRepository cityRepository;

    @Override
    public void run(String... args) {
        seedRoles();
        seedCities();
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
}