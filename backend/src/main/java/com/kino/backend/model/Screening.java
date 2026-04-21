package com.kino.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "screenings")
public class Screening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // MAGIA RELACJI NR 1: Łączymy z Filmem
    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    // MAGIA RELACJI NR 2: Łączymy z Salą
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    // Data i godzina seansu (LocalDateTime to najlepszy typ w Javie do dat i czasu)
    private LocalDateTime startTime;
    private Double price;
    public Screening() {
    }

    public Screening(Movie movie, Room room, LocalDateTime startTime, Double price) {
        this.movie = movie;
        this.room = room;
        this.startTime = startTime;
        this.price = price;
    }

    // --- Gettery i Settery ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}