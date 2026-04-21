package com.kino.backend.service;

import com.kino.backend.model.Ticket;
import com.kino.backend.model.Screening;
import com.kino.backend.model.User;
import com.kino.backend.repository.TicketRepository;
import com.kino.backend.repository.ScreeningRepository; // <--- NOWE
import com.kino.backend.repository.UserRepository;     // <--- NOWE
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final PdfService pdfService;
    private final EmailService emailService;
    private final ScreeningRepository screeningRepository; // <--- NOWE
    private final UserRepository userRepository;           // <--- NOWE

    // Zaktualizowany konstruktor (wstrzykujemy nowe repozytoria)
    public TicketService(TicketRepository ticketRepository, PdfService pdfService, EmailService emailService,
                         ScreeningRepository screeningRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.pdfService = pdfService;
        this.emailService = emailService;
        this.screeningRepository = screeningRepository;
        this.userRepository = userRepository;
    }

    // --- 1. POBIERANIE ZAJĘTYCH MIEJSC (Zostaje bez zmian) ---
    public List<String> getTakenSeatsForScreening(Long screeningId) {
        List<Ticket> tickets = ticketRepository.findByScreeningIdAndStatus(screeningId, "AKTYWNY");
        List<String> takenSeats = new ArrayList<>();
        for (Ticket ticket : tickets) {
            takenSeats.add(ticket.getSeatNumber());
        }
        return takenSeats;
    }

    // --- 2. KUPNO BILETU (NAPRAWIONE) ---
    public Ticket buyTicket(Ticket ticket) {

        // 1. ZABEZPIECZENIE I UZUPEŁNIENIE DANYCH
        // React przysłał nam same ID. Idziemy do bazy po pełne obiekty z tytułami, datami itp.!
        Screening fullScreening = screeningRepository.findById(ticket.getScreening().getId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono seansu"));

        User fullUser = userRepository.findById(ticket.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));

        // Podmieniamy "płytkie" obiekty na "pełne"
        ticket.setScreening(fullScreening);
        ticket.setUser(fullUser);

        // 2. Sprawdzamy podwójną sprzedaż
        boolean isTaken = ticketRepository.existsByScreeningIdAndSeatNumberAndStatus(
                ticket.getScreening().getId(),
                ticket.getSeatNumber(),
                "AKTYWNY"
        );

        if (isTaken) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Przepraszamy, miejsce " + ticket.getSeatNumber() + " zostało przed chwilą zajęte!");
        }

        // 3. Zapisujemy bilet
        ticket.setStatus("AKTYWNY");
        Ticket savedTicket = ticketRepository.save(ticket);

        // 4. Generowanie PDF i Wysyłka E-mail (teraz zadziała, bo obiekty są pełne!)
        try {
            byte[] pdfContent = pdfService.generateTicketPdf(savedTicket);

            String userEmail = savedTicket.getUser().getEmail();
            String movieTitle = savedTicket.getScreening().getMovie().getTitle();

            emailService.sendTicketWithAttachment(userEmail, movieTitle, pdfContent);
            System.out.println("Bilet wysłany pomyślnie na adres: " + userEmail);

        } catch (Exception e) {
            System.err.println("Błąd podczas generowania/wysyłania biletu PDF na maila: " + e.getMessage());
        }

        return savedTicket;
    }

    // --- 3. ZWROT BILETU (Zostaje bez zmian) ---
    public Ticket returnTicket(Long ticketId, String loggedInEmail, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono biletu"));

        // 1. Zabezpieczenie uprawnień (Zostaje bez zmian)
        if (!ticket.getUser().getEmail().equals(loggedInEmail) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie masz uprawnień do anulowania tego biletu!");
        }

        // 2. LOGIKA CZASOWA - ZMIANA TUTAJ:
        // Sprawdzamy czas TYLKO jeśli osoba wykonująca akcję NIE jest adminem
        if (!isAdmin) {
            LocalDateTime startTime = ticket.getScreening().getStartTime();

            // Używamy czasu rzeczywistego (lub Twojej zamrożonej daty do testów)
            LocalDateTime now = LocalDateTime.now();

            if (now.plusMinutes(30).isAfter(startTime)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zbyt późno na zwrot biletu. Seans zaczyna się za mniej niż 30 minut.");
            }
        }

        // 3. Jeśli przeszliśmy weryfikację (bo jest czas LUB bo jesteśmy adminem) -> Anulujemy
        ticket.setStatus("ANULOWANY");
        return ticketRepository.save(ticket);
    }
}