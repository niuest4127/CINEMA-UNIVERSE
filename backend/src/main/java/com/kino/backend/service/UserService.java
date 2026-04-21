package com.kino.backend.service;

import com.kino.backend.model.User;
import com.kino.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // <--- Narzędzie do szyfrowania

    // Wstrzykujemy repozytorium i szyfrator
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {
        // MAGIA: Bierzemy hasło, szyfrujemy je i nadpisujemy w obiekcie przed zapisem do bazy!
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}