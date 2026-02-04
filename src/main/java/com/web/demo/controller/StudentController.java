package com.web.demo.controller;

import com.web.demo.model.Student;
import com.web.demo.security.CurrentUser;
import com.web.demo.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService service;
    private final CurrentUser currentUser;

    public StudentController(StudentService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @GetMapping("/me") 
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Student> getProfile() {
        String email = currentUser.getEmail();
        Student student = service.getByEmail(email);  // Your existing method ✅
        return ResponseEntity.ok(student);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Student> update(@RequestBody Student updates) {
    	String email = currentUser.getEmail();
        Student s = service.updateProfile(email,updates);
        return ResponseEntity.ok(s);
    }

}
