package com.web.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "learn_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearnSkill {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String skillName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
}
