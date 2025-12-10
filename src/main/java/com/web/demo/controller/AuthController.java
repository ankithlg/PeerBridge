package com.web.demo.controller;

import com.web.demo.dto.AuthRequest;
import com.web.demo.dto.AuthResponse;
import com.web.demo.dto.RegisterRequest;
import com.web.demo.model.Student;
import com.web.demo.service.AuthService;
import com.web.demo.service.StudentService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final StudentService studentService;

    public AuthController(AuthService authService, StudentService studentService) {
        this.authService = authService;
        this.studentService = studentService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse resp = authService.register(req);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        AuthResponse resp = authService.login(req);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public Student getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return studentService.getByEmail(email);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public Student updateCurrentUser(@RequestBody Student updatedStudent,
                                     Authentication authentication) {

        String email = authentication.getName();
        Student existing = studentService.getByEmail(email);

        existing.setName(updatedStudent.getName());
        existing.setBio(updatedStudent.getBio());

        return studentService.save(existing);
    }
}
