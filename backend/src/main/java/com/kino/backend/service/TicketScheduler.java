package com.kino.backend.service;

import com.kino.backend.repository.TicketRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TicketScheduler {

    private final TicketRepository ticketRepository;

    public TicketScheduler(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Scheduled(fixedRate = 60000)
    public void completePastTickets() {
        int updatedCount = ticketRepository.updatePastTicketsStatus(LocalDateTime.now());

        if (updatedCount > 0) {
            System.out.println("SCHEDULER: Zaktualizowano status " + updatedCount + " biletów na 'ZAKOŃCZONY' (czas seansu minął).");
        }
    }
}