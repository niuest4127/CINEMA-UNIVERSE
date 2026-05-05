package com.kino.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "screenings")
public class Screening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;


    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;


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