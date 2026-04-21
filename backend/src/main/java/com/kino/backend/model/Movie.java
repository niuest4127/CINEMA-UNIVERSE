package com.kino.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 500)
    private String shortDescription; // Do kafelków na stronie głównej i repertuaru

    @Column(length = 2000)
    private String fullDescription; // Do strony ze szczegółami i wyborem miejsc

    private Integer durationMin;

    private String posterUrl;

    private String director; // Reżyser

    private String mainCast; // Obsada (np. po przecinku)

    // LocalDate to typ Javy przeznaczony specjalnie dla samej daty (bez godziny)
    private java.time.LocalDate releaseDate;

    // --- NOWE POLA ---
    private String genres; // np. "Akcja, Komedia"

    private Integer minimumAge; // np. 12, 15, 18

    private String languageVersion; // np. "Dubbing PL", "Napisy PL"
    // Pusty konstruktor (wymagany przez Hibernate)
    public Movie() {
    }

    // Konstruktor z parametrami (żeby nam było wygodniej tworzyć filmy w kodzie)
    public Movie(String title, String shortDescription,String fullDescription,  Integer durationMin, String posterUrl,String director, String mainCast, java.time.LocalDate releaseDate) {
        this.title = title;
        this.shortDescription = shortDescription;
        this.fullDescription = fullDescription;
        this.durationMin = durationMin;
        this.posterUrl = posterUrl;
        this.director = director;
        this.mainCast = mainCast;
        this.releaseDate = releaseDate;
        this.genres = genres;
        this.minimumAge = minimumAge;
        this.languageVersion = languageVersion;
    }

    // Gettery i Settery (metody do pobierania i zmieniania ukrytych danych)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }

    public String getFullDescription() { return fullDescription; }
    public void setFullDescription(String fullDescription) { this.fullDescription = fullDescription; }

    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public String getMainCast() { return mainCast; }
    public void setMainCast(String mainCast) { this.mainCast = mainCast; }

    public java.time.LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(java.time.LocalDate releaseDate) { this.releaseDate = releaseDate; }

    public String getGenres() { return genres; }
    public void setGenres(String genres) { this.genres = genres; }

    public Integer getMinimumAge() { return minimumAge; }
    public void setMinimumAge(Integer minimumAge) { this.minimumAge = minimumAge; }

    public String getLanguageVersion() { return languageVersion; }
    public void setLanguageVersion(String languageVersion) { this.languageVersion = languageVersion; }
}