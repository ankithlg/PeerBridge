package com.web.demo.repository;

import com.web.demo.model.TeachSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeachSkillRepository extends JpaRepository<TeachSkill, Long> {
    List<TeachSkill> findBySkillNameIgnoreCase(String skillName);
}
