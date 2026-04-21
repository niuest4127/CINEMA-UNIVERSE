package com.kino.backend.controller;

import com.kino.backend.model.Movie;
import com.kino.backend.model.Screening;
import com.kino.backend.repository.MovieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin
public class MovieController {

    private final MovieRepository movieRepository;

    // Wstrzykujemy nasze narzędzie do bazy danych do kontrolera
    public MovieController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    // Odbieramy zapytanie GET (pobieranie danych) z przeglądarki/Reacta
    @GetMapping
    public List<Movie> getAllMovies() {
        // Używamy gotowej metody findAll(), która zwraca listę wszystkich filmów z bazy
        return movieRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ResponseEntity<Movie> addMovie(@RequestBody Movie movie) {
        // Zapisujemy nowy film do bazy
        Movie savedMovie = movieRepository.save(movie);
        return ResponseEntity.ok(savedMovie);
    }
    // NOWE: DODAWANIE FILMÓW
//    @PostMapping
//    public Movie addMovie(@RequestBody Movie movie) {
//        // Zapisujemy przysłany film w bazie i od razu go zwracamy,
//        // żeby React wiedział, jakie ID nadała mu baza.
//        return movieRepository.save(movie);
//    }
}