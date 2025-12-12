package com.web.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequest {
    private String skillName; // what current user wants to LEARN
    private String preferredMode; // online/offline/both
    private String availableTime; // partial match
    private Integer page;
    private Integer size;
    private String sortBy; // "relevance", "experience", "availability"
}
