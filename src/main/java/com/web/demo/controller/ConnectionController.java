package com.web.demo.controller;

import com.web.demo.model.ConnectionRequest;
import com.web.demo.model.RequestStatus;
import com.web.demo.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/connect")
public class ConnectionController {

    private final StudentService studentService;

    public ConnectionController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConnectionRequest> send(
            @RequestParam Long receiverId,
            Authentication authentication) {

        String senderEmail = authentication.getName();
        Long senderId = studentService.getByEmail(senderEmail).getId();

        ConnectionRequest cr = studentService.sendConnection(senderId, receiverId);
        return ResponseEntity.ok(cr);
    }

    @PostMapping("/respond")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConnectionRequest> respond(
            @RequestParam Long requestId,
            @RequestParam RequestStatus status,
            Authentication authentication) {

        String userEmail = authentication.getName();
        Long userId = studentService.getByEmail(userEmail).getId();

        ConnectionRequest cr = studentService.respondConnection(requestId, status, userId);
        return ResponseEntity.ok(cr);
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getStatus(
            @RequestParam Long user1,
            @RequestParam Long user2) {

        return ResponseEntity.ok(studentService.getConnectionStatus(user1, user2));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> removeConnection(
            @RequestParam Long student2,
            Authentication authentication) {

        String userEmail = authentication.getName();
        Long student1 = studentService.getByEmail(userEmail).getId();

        String result = studentService.removeConnection(student1, student2);
        return ResponseEntity.ok(result);
    }
}
