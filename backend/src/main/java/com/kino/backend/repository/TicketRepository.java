package com.kino.backend.repository;

import com.kino.backend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // DODANE
import org.springframework.data.repository.query.Param; // DODANE
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime; // DODANE
import java.util.List;
import org.springframework.data.jpa.repository.Modifying; // DODANE


@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByUserId(Long userId, Pageable pageable);
    List<Ticket> findByScreeningIdAndStatus(Long screeningId, String status);
    List<Ticket> findByUserEmailOrderByScreeningStartTimeDesc(String email);
    List<Ticket> findByUserId(Long userId);
    boolean existsByScreeningIdAndSeatNumberAndStatus(Long screeningId, String seatNumber, String status);


    @Query("SELECT t FROM Ticket t WHERE t.user.email = :email AND t.status = 'AKTYWNY' AND t.screening.startTime > :now ORDER BY t.screening.startTime ASC")
    Page<Ticket> findMyActiveTickets(@Param("email") String email, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.user.email = :email AND (t.status = 'ANULOWANY' OR t.status = 'ZAKOŃCZONY' OR t.screening.startTime <= :now) ORDER BY t.screening.startTime DESC")
    Page<Ticket> findMyHistoryTickets(@Param("email") String email, @Param("now") LocalDateTime now, Pageable pageable);


    @Transactional
    void deleteByScreeningId(Long screeningId);

    @Modifying
    @Transactional
    @Query("UPDATE Ticket t SET t.status = 'ZAKOŃCZONY' WHERE t.status = 'AKTYWNY' AND t.screening.startTime <= :now")
    int updatePastTicketsStatus(@Param("now") LocalDateTime now);
}