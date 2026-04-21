package com.kino.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Otwieramy wszystkie adresy zaczynające się od /api/...
                        .allowedOrigins("http://localhost:5173") // Wpuszczamy TYLKO Twojego Reacta
                        .allowedMethods("GET", "POST", "PUT", "DELETE") // Pozwalamy mu na wszystkie akcje
                        .allowCredentials(true); // Ważne do logowania w przyszłości!
            }
        };
    }
}