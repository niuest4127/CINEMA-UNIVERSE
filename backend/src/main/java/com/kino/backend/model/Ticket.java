package com.kino.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Łączymy z Użytkownikiem
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Łączymy z Seansem
    @ManyToOne
    @JoinColumn(name = "screening_id")
    private Screening screening;

    // Numer miejsca wybranego w React (np. "A1", "C4")
    private String seatNumber;

    // Status biletu (np. "AKTYWNY", "ANULOWANY") - przyda się do zwrotów!
    private String status;

    public Ticket() {
    }

    public Ticket(User user, Screening screening, String seatNumber, String status) {
        this.user = user;
        this.screening = screening;
        this.seatNumber = seatNumber;
        this.status = status;
    }

    // --- Gettery i Settery ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Screening getScreening() { return screening; }
    public void setScreening(Screening screening) { this.screening = screening; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}