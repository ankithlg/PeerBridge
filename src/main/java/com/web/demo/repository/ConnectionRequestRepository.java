package com.web.demo.repository;

import com.web.demo.model.ConnectionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {

    // Latest request: sender → receiver
    Optional<ConnectionRequest> findTopBySender_IdAndReceiver_IdOrderByCreatedAtDesc(
            Long senderId, Long receiverId
    );

    // Latest request: receiver → sender
    Optional<ConnectionRequest> findTopByReceiver_IdAndSender_IdOrderByCreatedAtDesc(
            Long receiverId, Long senderId
    );

    // Fetch ANY connection between 2 users (either direction)
    @Query("""
            SELECT r FROM ConnectionRequest r
            WHERE (r.sender.id = :student1 AND r.receiver.id = :student2)
               OR (r.sender.id = :student2 AND r.receiver.id = :student1)
           """)
    Optional<ConnectionRequest> findConnectionBetween(Long student1, Long student2);

    // Fetch LATEST connection between 2 users (any direction)
    @Query("""
            SELECT r FROM ConnectionRequest r
            WHERE (r.sender.id = :user1 AND r.receiver.id = :user2)
               OR (r.sender.id = :user2 AND r.receiver.id = :user1)
            ORDER BY r.createdAt DESC
            """)
    Optional<ConnectionRequest> findTopByConnection(Long user1, Long user2);

    // Delete ALL connections between two users
    @Transactional
    @Modifying
    @Query("""
            DELETE FROM ConnectionRequest r
            WHERE (r.sender.id = :student1 AND r.receiver.id = :student2)
               OR (r.sender.id = :student2 AND r.receiver.id = :student1)
           """)
    void deleteConnectionBetween(Long student1, Long student2);
}
