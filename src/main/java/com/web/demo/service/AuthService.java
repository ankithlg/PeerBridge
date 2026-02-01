package com.web.demo.service;

import com.web.demo.dto.AuthRequest;
import com.web.demo.dto.AuthResponse;
import com.web.demo.dto.RegisterRequest;
import com.web.demo.model.Student;
import com.web.demo.repository.StudentRepository;
import com.web.demo.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;




@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        Student student = Student.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .bio(request.getBio()) // set bio
                .preferredMode(request.getPreferredMode())
                .availableTime(request.getAvailableTime())      
                .build();
        
        studentRepository.save(student);
        String token = jwtUtil.generateToken(student.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            String token = jwtUtil.generateToken(request.getEmail());
            return new AuthResponse(token);

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

}
