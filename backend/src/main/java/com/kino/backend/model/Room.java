package com.kino.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // np. "Sala 1", "Sala VIP"

    private Integer totalSeats; // np. 50 (przyda nam się później do sprawdzania, czy są wolne miejsca)

    public Room() {
    }

    public Room(String name, Integer totalSeats) {
        this.name = name;
        this.totalSeats = totalSeats;
    }

    // --- Gettery i Settery ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
}