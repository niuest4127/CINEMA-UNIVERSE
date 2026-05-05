package com.kino.backend.service;

import com.kino.backend.model.Ticket;
import com.kino.backend.model.Screening;
import com.kino.backend.model.User;
import com.kino.backend.repository.TicketRepository;
import com.kino.backend.repository.ScreeningRepository;
import com.kino.backend.repository.UserRepository;
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
    private final ScreeningRepository screeningRepository;
    private final UserRepository userRepository;


    public TicketService(TicketRepository ticketRepository, PdfService pdfService, EmailService emailService,
                         ScreeningRepository screeningRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.pdfService = pdfService;
        this.emailService = emailService;
        this.screeningRepository = screeningRepository;
        this.userRepository = userRepository;
    }

    //POBIERANIE ZAJĘTYCH MIEJSC
    public List<String> getTakenSeatsForScreening(Long screeningId) {
        List<Ticket> tickets = ticketRepository.findByScreeningIdAndStatus(screeningId, "AKTYWNY");
        List<String> takenSeats = new ArrayList<>();
        for (Ticket ticket : tickets) {
            takenSeats.add(ticket.getSeatNumber());
        }
        return takenSeats;
    }

    // KUPOWANIE BILETU
    public Ticket buyTicket(Ticket ticket) {

        Screening fullScreening = screeningRepository.findById(ticket.getScreening().getId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono seansu"));

        User fullUser = userRepository.findById(ticket.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));


        ticket.setScreening(fullScreening);
        ticket.setUser(fullUser);
        boolean isTaken = ticketRepository.existsByScreeningIdAndSeatNumberAndStatus(
                ticket.getScreening().getId(),
                ticket.getSeatNumber(),
                "AKTYWNY"
        );

        if (isTaken) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Przepraszamy, miejsce " + ticket.getSeatNumber() + " zostało przed chwilą zajęte!");
        }


        ticket.setStatus("AKTYWNY");
        Ticket savedTicket = ticketRepository.save(ticket);

        //GenerowaniePDf i Wysyłka email
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


    public Ticket returnTicket(Long ticketId, String loggedInEmail, boolean isAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono biletu"));


        if (!ticket.getUser().getEmail().equals(loggedInEmail) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie masz uprawnień do anulowania tego biletu!");
        }

        if (!isAdmin) {
            LocalDateTime startTime = ticket.getScreening().getStartTime();

            LocalDateTime now = LocalDateTime.now();

            if (now.plusMinutes(30).isAfter(startTime)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Zbyt późno na zwrot biletu. Seans zaczyna się za mniej niż 30 minut.");
            }
        }

        ticket.setStatus("ANULOWANY");
        return ticketRepository.save(ticket);
    }
}