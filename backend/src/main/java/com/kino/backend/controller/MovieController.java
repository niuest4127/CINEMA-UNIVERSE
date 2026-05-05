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


    public MovieController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }


    @GetMapping
    public List<Movie> getAllMovies() {

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

        Movie savedMovie = movieRepository.save(movie);
        return ResponseEntity.ok(savedMovie);
    }

}