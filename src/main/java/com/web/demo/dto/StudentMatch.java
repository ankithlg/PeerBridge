package com.web.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentMatch {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String preferredMode;
    private String availableTime;
    private String skillName;
    private String experienceLevel;
    private double matchScore; // 0-100
    private boolean alreadyConnected;
}
