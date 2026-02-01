package com.web.demo.controller;

import com.web.demo.model.ConnectionRequest;


import com.web.demo.model.RequestStatus;
import com.web.demo.security.CurrentUser;
import com.web.demo.service.StudentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/connect")
public class ConnectionController {

    private final StudentService studentService;
    private final CurrentUser currentUser;

    public ConnectionController(StudentService studentService, CurrentUser currentUser) {
        this.studentService = studentService;
        this.currentUser = currentUser;
    }

    private Long getCurrentUserId() {
        String email = currentUser.getEmail();
        var student = studentService.getByEmail(email);
        if (student == null) {
            throw new IllegalStateException("Authenticated user not found in database");
        }
        return student.getId();
    }

    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConnectionRequest> send(@RequestParam Long receiverId) {
        Long senderId = getCurrentUserId();
        ConnectionRequest cr = studentService.sendConnection(senderId, receiverId);
        return ResponseEntity.ok(cr);
    }

    @PostMapping("/respond")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConnectionRequest> respond(
            @RequestParam Long requestId,
            @RequestParam RequestStatus status) {

        Long userId = getCurrentUserId();
        ConnectionRequest cr = studentService.respondConnection(requestId, status, userId);
        return ResponseEntity.ok(cr);
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> getStatus(@RequestParam Long student2) {
        Long student1 = getCurrentUserId();
        String result = studentService.getConnectionStatus(student1, student2);
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/remove")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> removeConnection(@RequestParam Long student2) {
        Long student1 = getCurrentUserId();
        String result = studentService.removeConnection(student1, student2);
        return ResponseEntity.ok(result);
    }
}
