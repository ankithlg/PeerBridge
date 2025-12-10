package com.web.demo.controller;

import com.web.demo.model.LearnSkill;
import com.web.demo.model.TeachSkill;
import com.web.demo.security.CurrentUser;
import com.web.demo.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skills")
public class SkillController {

    private final StudentService service;
    private final CurrentUser currentUser;

    public SkillController(StudentService service, CurrentUser currentUser) {
        this.service = service;
        this.currentUser = currentUser;
    }

    @PostMapping("/teach")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeachSkill> addTeach(@RequestBody TeachSkill skill) {
        String email = currentUser.getEmail();
        TeachSkill saved = service.addTeachSkill(email, skill);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/learn")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LearnSkill> addLearn(@RequestBody LearnSkill skill) {
        String email = currentUser.getEmail();
        LearnSkill saved = service.addLearnSkill(email, skill);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/matches")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TeachSkill>> findMatches(@RequestParam String skill) {
        String email = currentUser.getEmail();
        List<TeachSkill> matches = service.findTeachersForSkillExcludingSelf(skill, email);
        return ResponseEntity.ok(matches);
    }
}
