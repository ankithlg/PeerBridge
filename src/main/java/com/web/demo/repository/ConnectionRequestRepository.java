package com.web.demo.repository;

import com.web.demo.model.ConnectionRequest;
import com.web.demo.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, Long> {

    Optional<ConnectionRequest> findTopBySender_IdAndReceiver_IdOrderByCreatedAtDesc(Long senderId, Long receiverId);
    Optional<ConnectionRequest> findTopByReceiver_IdAndSender_IdOrderByCreatedAtDesc(Long receiverId, Long senderId);

    @Query("""
            SELECT r FROM ConnectionRequest r
            WHERE (r.sender.id = :student1 AND r.receiver.id = :student2)
               OR (r.sender.id = :student2 AND r.receiver.id = :student1)
           """)
    Optional<ConnectionRequest> findConnectionBetween(Long student1, Long student2);

    @Query("""
            SELECT cr FROM ConnectionRequest cr 
            WHERE (cr.sender.id = :student1 AND cr.receiver.id = :student2) 
               OR (cr.sender.id = :student2 AND cr.receiver.id = :student1)
            ORDER BY cr.createdAt DESC
        """)
    Optional<ConnectionRequest> findTopByStudents(@Param("student1") Long student1, @Param("student2") Long student2);

    // ✅ FIXED: Added missing @Query, @Modifying, @Transactional
    @Transactional
    @Modifying
    @Query("""
            DELETE FROM ConnectionRequest r
            WHERE (r.sender.id = :student1 AND r.receiver.id = :student2)
               OR (r.sender.id = :student2 AND r.receiver.id = :student1)
           """)
    void deleteConnectionBetween(Long student1, Long student2);
    
    @Query("""
            SELECT CASE WHEN COUNT(cr) > 0 THEN true ELSE false END 
            FROM ConnectionRequest cr 
            WHERE ((cr.sender.id = :user1 AND cr.receiver.id = :user2) 
                OR (cr.sender.id = :user2 AND cr.receiver.id = :user1)) 
                AND cr.status = 'ACCEPTED'
        """)
    boolean existsAcceptedConnection(@Param("user1") Long user1Id, @Param("user2") Long user2Id);

}
