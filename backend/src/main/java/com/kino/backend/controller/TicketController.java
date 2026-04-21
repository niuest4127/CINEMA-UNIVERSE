package com.kino.backend.controller;

import com.kino.backend.model.Ticket;
import com.kino.backend.service.PdfService;
import com.kino.backend.service.TicketService;
import com.kino.backend.repository.TicketRepository; // Zostawiamy do zwykłego dodawania biletów
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin
public class TicketController {

    private final TicketRepository ticketRepository;
    private final TicketService ticketService; // Dodajemy naszego "kierownika"
    private final PdfService pdfService;
    // Wstrzykujemy oba narzędzia
    public TicketController(TicketRepository ticketRepository, TicketService ticketService,PdfService pdfService) {
        this.ticketRepository = ticketRepository;
        this.ticketService = ticketService;
        this.pdfService = pdfService;
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @PostMapping
    public Ticket addTicket(@RequestBody Ticket ticket) {
        // ZAMIAST: return ticketRepository.save(ticket);
        // UŻYWAMY NASZEGO BEZPIECZNEGO SERWISU:
        return ticketService.buyTicket(ticket);
    }

    // --- NOWY ENDPOINT DLA REACTA ---
    // Adres będzie wyglądał np. tak: /api/tickets/screening/1/taken-seats
    @GetMapping("/screening/{screeningId}/taken-seats")
    public List<String> getTakenSeats(@PathVariable Long screeningId) {
        return ticketService.getTakenSeatsForScreening(screeningId);
    }
    // NOWY ENDPOINT DLA REACTA: Zwrot biletu
    // Adres będzie wyglądał np. tak: /api/tickets/1/return
    @PutMapping("/{ticketId}/return")
    public Ticket returnTicket(@PathVariable Long ticketId, Authentication authentication) {
        // authentication.getName() zwraca nam EMAIL zalogowanej w tej chwili osoby
        String loggedInEmail = authentication.getName();

        // Sprawdzamy, czy ta osoba ma uprawnienia "ROLE_ADMIN" (Spring Security dodaje prefiks ROLE_)
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // Przekazujemy te dane do kalkulatora!
        return ticketService.returnTicket(ticketId, loggedInEmail, isAdmin);
    }
    // --- POBIERANIE BILETÓW ZALOGOWANEGO UŻYTKOWNIKA ---
    @GetMapping("/my")
    public List<Ticket> getMyTickets(Authentication authentication) {
        // authentication.getName() to email zalogowanego użytkownika
        String userEmail = authentication.getName();
        return ticketRepository.findByUserEmailOrderByScreeningStartTimeDesc(userEmail);
    }
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadTicketPdf(@PathVariable Long id) throws Exception {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        byte[] pdfContent = pdfService.generateTicketPdf(ticket);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }
    // --- NOWY ENDPOINT DLA PANELU ADMINA (Pobieranie biletów danego usera) ---
    @GetMapping("/user/{userId}")
    public List<Ticket> getTicketsForUser(@PathVariable Long userId) {
        // Używamy metody, którą dodaliśmy do repozytorium w poprzednim kroku
        return ticketRepository.findByUserId(userId);
    }

}