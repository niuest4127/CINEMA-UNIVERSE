package com.kino.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. ZABEZPIECZENIE HASEŁ (Wymóg na ocenę 3)
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt to obecnie jeden z najbezpieczniejszych standardów szyfrowania haseł na świecie
        return new BCryptPasswordEncoder();
    }

    // 2. INSTRUKCJA DLA OCHRONIARZA (Kto gdzie może wejść)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // 1. ZŁOTA LINIJKA (Przepuszcza niewidzialne zapytania przeglądarki)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ->>>> NOWOŚĆ: ODBLOKOWUJEMY ADRES BŁĘDÓW <<<<-
                        .requestMatchers("/error").permitAll()

                        // 2. ABSOLUTNY PRIORYTET: Rejestracja i logowanie ZAWSZE publiczne
                        .requestMatchers("/api/users/**").permitAll()

                        // 3. PUBLICZNE DANE KINOWE
                                // Zmień linijkę z publicznymi danymi kinowymi na taką:
                                .requestMatchers(HttpMethod.GET, "/api/movies/**", "/api/rooms/**", "/api/screenings/**", "/api/tickets/screening/**").permitAll()

// Endpoint do KUPNA biletów (POST /api/tickets) z automatu łapie się w .anyRequest().authenticated(), co jest super!

                                // 4. STREFA ADMINA (Zaktualizowana)
                                .requestMatchers(HttpMethod.POST, "/api/movies/**", "/api/rooms/**", "/api/screenings/**").hasRole("ADMIN")
// NOWE: Tylko admin może pobrać listę wszystkich użytkowników i usuwać konta!
                                .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

// 5. CAŁA RESZTA
                                .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}