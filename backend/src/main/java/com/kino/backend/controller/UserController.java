package com.kino.backend.controller;

import com.kino.backend.model.Ticket;
import com.kino.backend.model.User;
import com.kino.backend.repository.UserRepository;
import com.kino.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.kino.backend.repository.TicketRepository; // <--- DODAJ
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin // To już dodałeś wcześniej, super!
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final TicketRepository ticketRepository; // <--- DODAJ
    // Zaktualizowany konstruktor z TicketRepository
    public UserController(UserRepository userRepository, UserService userService,
                          PasswordEncoder passwordEncoder, TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.ticketRepository = ticketRepository; // <--- DODAJ
    }

    // Tego ukośnika z "register" nam brakowało do szczęścia!
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        try {
            // Ustawiamy domyślną rolę
            user.setRole("USER");
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Ukośnik "login"
    @PostMapping("/login")
    public ResponseEntity<User> login(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedData, Authentication authentication) {
        // 1. Znajdujemy zalogowanego usera
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Aktualizujemy dozwolone pola (nie ruszamy ID, hasła ani roli!)
        currentUser.setFirstName(updatedData.getFirstName());
        currentUser.setLastName(updatedData.getLastName());
        currentUser.setPhoneNumber(updatedData.getPhoneNumber());
        currentUser.setAddress(updatedData.getAddress());
        currentUser.setDateOfBirth(updatedData.getDateOfBirth());
        // Jeśli chcesz pozwolić na zmianę emaila, musisz tu dodać logikę sprawdzającą, czy nowy email nie jest już zajęty!

        // 3. Zapisujemy i zwracamy zaktualizowanego usera
        userRepository.save(currentUser);
        return ResponseEntity.ok(currentUser);
    }
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody java.util.Map<String, String> passwords, Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");

        // 1. Sprawdzamy, czy podał poprawne stare hasło
        if (!passwordEncoder.matches(oldPassword, currentUser.getPassword())) {
            return ResponseEntity.badRequest().body("Obecne hasło jest nieprawidłowe!");
        }

        // 2. Szyfrujemy nowe hasło i zapisujemy
        currentUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(currentUser);

        return ResponseEntity.ok().body("Hasło zostało zmienione pomyślnie.");
    }
    @DeleteMapping("/{id}")
    @Transactional // Ta adnotacja sprawia, że obie operacje wykonają się jako jedna cała transakcja (bezpieczeństwo!)
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {

        // 1. Sprawdzamy, czy użytkownik w ogóle istnieje
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));

        // Zabezpieczenie: Nie pozwalamy adminowi usunąć samego siebie przez pomyłkę!
        if (userToDelete.getEmail().equals(authentication.getName())) {
            return ResponseEntity.badRequest().body("Nie możesz usunąć własnego konta administratora!");
        }

        // 2. Znajdujemy wszystkie bilety użytkownika (zarówno aktywne, jak i z historii)
        List<Ticket> userTickets = ticketRepository.findByUserId(id);

        // 3. Usuwamy bilety (Czyścimy powiązania klucza obcego)
        ticketRepository.deleteAll(userTickets);

        // 4. Dopiero teraz bezpiecznie usuwamy samego użytkownika
        userRepository.delete(userToDelete);

        return ResponseEntity.ok().body("Użytkownik i wszystkie jego bilety zostały usunięte z systemu.");
    }
}