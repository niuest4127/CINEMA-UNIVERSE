package com.kino.backend.repository;

import com.kino.backend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByUserId(Long userId, Pageable pageable);
    // Szukamy tylko biletów o konkretnym statusie!
    List<Ticket> findByScreeningIdAndStatus(Long screeningId, String status);
    // Dodaj to pod swoimi obecnymi metodami:
    List<Ticket> findByUserEmailOrderByScreeningStartTimeDesc(String email);
    List<Ticket> findByUserId(Long userId);
    // Sprawdzamy, czy istnieje bilet na to miejsce, ale tylko wśród AKTYWNYCH!
    boolean existsByScreeningIdAndSeatNumberAndStatus(Long screeningId, String seatNumber, String status);


}