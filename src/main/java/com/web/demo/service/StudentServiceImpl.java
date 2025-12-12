package com.web.demo.service;

import com.web.demo.dto.MatchRequest;
import com.web.demo.dto.MatchResponse;
import com.web.demo.model.*;
import com.web.demo.model.Student;

import java.util.List;
import java.util.Optional;

public interface StudentServiceImpl {

    Student getByEmail(String email);

    Student save(Student student);

    Optional<Student> findById(Long id);

    Student updateProfile(Long id, Student updates);

    TeachSkill addTeachSkill(String studentEmail, TeachSkill skill);

    LearnSkill addLearnSkill(String studentEmail, LearnSkill skill);

    List<TeachSkill> findTeachersForSkillExcludingSelf(String skill, String studentEmail);

    ConnectionRequest sendConnection(Long senderId, Long receiverId);

    ConnectionRequest respondConnection(Long requestId, RequestStatus status, Long userId);

    String getConnectionStatus(Long student1, Long student2);

    String removeConnection(Long student1, Long student2);
    
    MatchResponse findBestMatches(Long currentUserId, MatchRequest request);

	

}
