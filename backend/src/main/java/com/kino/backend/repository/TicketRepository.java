package com.kino.backend.repository;

import com.kino.backend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // DODANE
import org.springframework.data.repository.query.Param; // DODANE
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime; // DODANE
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByUserId(Long userId, Pageable pageable);
    List<Ticket> findByScreeningIdAndStatus(Long screeningId, String status);
    List<Ticket> findByUserEmailOrderByScreeningStartTimeDesc(String email);
    List<Ticket> findByUserId(Long userId);
    boolean existsByScreeningIdAndSeatNumberAndStatus(Long screeningId, String seatNumber, String status);

    // --- NOWE METODY DO PAGINACJI W PROFILU ---

    // 1. Aktywne bilety (Status AKTYWNY + seans w przyszłości)
    @Query("SELECT t FROM Ticket t WHERE t.user.email = :email AND t.status = 'AKTYWNY' AND t.screening.startTime > :now ORDER BY t.screening.startTime ASC")
    Page<Ticket> findMyActiveTickets(@Param("email") String email, @Param("now") LocalDateTime now, Pageable pageable);

    // 2. Historia biletów (Status ANULOWANY lub seans w przeszłości)
    @Query("SELECT t FROM Ticket t WHERE t.user.email = :email AND (t.status = 'ANULOWANY' OR t.screening.startTime <= :now) ORDER BY t.screening.startTime DESC")
    Page<Ticket> findMyHistoryTickets(@Param("email") String email, @Param("now") LocalDateTime now, Pageable pageable);
}