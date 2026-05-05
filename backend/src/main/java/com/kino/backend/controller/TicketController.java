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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin
public class TicketController {

    private final TicketRepository ticketRepository;
    private final TicketService ticketService;
    private final PdfService pdfService;
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
        return ticketService.buyTicket(ticket);
    }


    @GetMapping("/screening/{screeningId}/taken-seats")
    public List<String> getTakenSeats(@PathVariable Long screeningId) {
        return ticketService.getTakenSeatsForScreening(screeningId);
    }

    @PutMapping("/{ticketId}/return")
    public Ticket returnTicket(@PathVariable Long ticketId, Authentication authentication) {

        String loggedInEmail = authentication.getName();


        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return ticketService.returnTicket(ticketId, loggedInEmail, isAdmin);
    }

    @GetMapping("/my")
    public List<Ticket> getMyTickets(Authentication authentication) {

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

    @GetMapping("/user/{userId}")
    public List<Ticket> getTicketsForUser(@PathVariable Long userId) {

        return ticketRepository.findByUserId(userId);
    }
    @GetMapping("/my/active")
    public Page<Ticket> getMyActiveTickets(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String userEmail = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);

        // dotestow
        LocalDateTime mockNow = LocalDateTime.of(2026, 3, 10, 11, 50);


        return ticketRepository.findMyActiveTickets(userEmail, LocalDateTime.now(), pageable);
    }

    @GetMapping("/my/history")
    public Page<Ticket> getMyHistoryTickets(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String userEmail = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);

        // do testow
        LocalDateTime mockNow = LocalDateTime.of(2026, 3, 10, 11, 50);


        return ticketRepository.findMyHistoryTickets(userEmail, LocalDateTime.now(), pageable);
    }

}