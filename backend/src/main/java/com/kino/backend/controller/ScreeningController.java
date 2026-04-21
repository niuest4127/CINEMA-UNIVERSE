package com.kino.backend.controller;

import com.kino.backend.model.Screening;
import com.kino.backend.repository.ScreeningRepository;
import org.springframework.http.ResponseEntity; // DODAJ TEN IMPORT
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screenings")
@CrossOrigin
public class ScreeningController {

    private final ScreeningRepository screeningRepository;

    public ScreeningController(ScreeningRepository screeningRepository) {
        this.screeningRepository = screeningRepository;
    }

    @GetMapping
    public List<Screening> getAllScreenings() {
        return screeningRepository.findAll();
    }

    // --- BRAKUJĄCA METODA ---
    @GetMapping("/{id}")
    public ResponseEntity<Screening> getScreeningById(@PathVariable Long id) {
        return screeningRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // ------------------------

    @PostMapping
    public Screening addScreening(@RequestBody Screening screening) {
        return screeningRepository.save(screening);
    }
    // Pobieranie wszystkich seansów dla konkretnego filmu
    @GetMapping("/movie/{movieId}")
    public List<Screening> getScreeningsByMovieId(@PathVariable Long movieId) {
        return screeningRepository.findAll().stream()
                .filter(s -> s.getMovie().getId().equals(movieId))
                // Tutaj opcjonalnie możesz dodać filtr: .filter(s -> s.getStartTime().isAfter(LocalDateTime.now()))
                .sorted((s1, s2) -> s1.getStartTime().compareTo(s2.getStartTime()))
                .toList();
    }
}