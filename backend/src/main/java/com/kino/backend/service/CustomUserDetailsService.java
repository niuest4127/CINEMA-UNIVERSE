package com.kino.backend.service;

import com.kino.backend.model.User;
import com.kino.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Szukamy naszego użytkownika w bazie (lub rzucamy błąd, jeśli go nie ma)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Nie znaleziono użytkownika: " + email));

        // 2. Tłumaczymy naszego Usera na obiekt UserDetails, który rozumie Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword()) // Tu siedzi ten długi zaszyfrowany ciąg znaków!
                .roles(user.getRole())        // Mówimy ochroniarzowi: "To jest ADMIN" albo "To jest USER"
                .build();
    }
}