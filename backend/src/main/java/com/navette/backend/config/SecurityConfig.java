package com.navette.backend.config;

import com.navette.backend.security.CustomUserDetailsService;
import com.navette.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider =
                new DaoAuthenticationProvider();

        authenticationProvider.setUserDetailsService(
                customUserDetailsService
        );

        authenticationProvider.setPasswordEncoder(
                passwordEncoder()
        );

        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors -> {
                })

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authenticationProvider(authenticationProvider())

                .authorizeHttpRequests(auth -> auth

                        /*
                         * Routes publiques d’authentification
                         */
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/register-company"
                        )
                        .permitAll()

                        /*
                         * Autres routes publiques d’authentification,
                         * par exemple vérification ou rafraîchissement.
                         */
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        /*
                         * Routes publiques générales
                         */
                        .requestMatchers("/api/test")
                        .permitAll()

                        .requestMatchers("/api/cities/**")
                        .permitAll()

                        .requestMatchers("/api/offers/**")
                        .permitAll()

                        /*
                         * Routes réservées aux utilisateurs
                         */
                        .requestMatchers("/api/user/**")
                        .hasAuthority("ROLE_USER")

                        /*
                         * Routes réservées aux sociétés
                         */
                        .requestMatchers("/api/company/**")
                        .hasAuthority("ROLE_COMPANY")

                        /*
                         * Routes réservées à l’administrateur
                         */
                        .requestMatchers("/api/admin/**")
                        .hasAuthority("ROLE_ADMIN")

                        /*
                         * Toutes les autres routes nécessitent
                         * une authentification valide.
                         */
                        .anyRequest()
                        .authenticated()
                )

                .formLogin(form -> form.disable())

                .httpBasic(basic -> basic.disable())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}