package com.kino.backend.model;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "users") // Zabezpieczenie przed słowem zastrzeżonym w bazie
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email nie może być pusty")
    @Email(message = "Podaj poprawny format adresu email")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Hasło nie może być puste")
    @Size(min = 6, message = "Hasło musi mieć co najmniej 6 znaków")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String role; // "USER" lub "ADMIN"

    // --- NOWE DANE ZAKŁADKI PROFIL ---
    private String firstName;

    private String lastName;

    private String address;

    private String phoneNumber;

    private java.time.LocalDate dateOfBirth;

    // 1. Pusty konstruktor dla Hibernate
    public User() {
    }

    // 2. Pełny konstruktor dla nas
    public User(String email, String password, String role, String firstName, String lastName, String address, String phoneNumber, java.time.LocalDate dateOfBirth) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.dateOfBirth = dateOfBirth;
    }

    // --- Gettery i Settery ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public java.time.LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(java.time.LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}