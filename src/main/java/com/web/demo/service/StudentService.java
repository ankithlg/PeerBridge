package com.web.demo.service;

import com.web.demo.model.Student;
import com.web.demo.dto.MatchRequest;
import com.web.demo.dto.MatchResponse;
import com.web.demo.dto.StudentMatch;
import com.web.demo.dto.StudentMatch;
import com.web.demo.model.*;
import com.web.demo.repository.*;
import com.web.demo.service.StudentServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;  

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService implements StudentServiceImpl {

    private final StudentRepository studentRepository;
    private final TeachSkillRepository teachSkillRepository;
    private final LearnSkillRepository learnSkillRepository;
    private final ConnectionRequestRepository connectionRequestRepository;

    public StudentService(StudentRepository studentRepository,
                              TeachSkillRepository teachSkillRepository,
                              LearnSkillRepository learnSkillRepository,
                              ConnectionRequestRepository connectionRequestRepository) {

        this.studentRepository = studentRepository;
        this.teachSkillRepository = teachSkillRepository;
        this.learnSkillRepository = learnSkillRepository;
        this.connectionRequestRepository = connectionRequestRepository;
    }

    public Student findById(Long id) {
        return studentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Student not found: " + id));
    }
    
    @Override
    public Student getByEmail(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public Student save(Student student) {
        return studentRepository.save(student);
    }

    @Override
    public Student updateProfile(String email, Student updates) {
        Student s = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getName() != null) {
            s.setName(updates.getName());
        }
        if (updates.getBio() != null) {
            s.setBio(updates.getBio());
        }
        if (updates.getAvailableTime() != null) {
            s.setAvailableTime(updates.getAvailableTime());
        }
        if (updates.getPreferredMode() != null) {
            s.setPreferredMode(updates.getPreferredMode());
        }

      return studentRepository.save(s);
      
    }

    @Override
    public TeachSkill addTeachSkill(String studentEmail, TeachSkill skill) {
        Student student = getByEmail(studentEmail);
        skill.setStudent(student);
        return teachSkillRepository.save(skill);
    }

    @Override
    public LearnSkill addLearnSkill(String studentEmail, LearnSkill skill) {
        Student student = getByEmail(studentEmail);
        skill.setStudent(student);
        return learnSkillRepository.save(skill);
    }
    
    public List<TeachSkill> getCurrentUserTeachSkills(Long studentId) {
        return findById(studentId).getTeachSkills().stream().toList();
    }

    public List<LearnSkill> getCurrentUserLearnSkills(Long studentId) {
        return findById(studentId).getLearnSkills().stream().toList();
    }
    @Override
    public List<TeachSkill> findTeachersForSkillExcludingSelf(String skillName, String studentEmail) {
        Student current = getByEmail(studentEmail);

        return teachSkillRepository.findBySkillNameIgnoreCase(skillName)
                .stream()
                .filter(ts -> !ts.getStudent().getId().equals(current.getId()))
                .toList();
    }

    @Override
    public ConnectionRequest sendConnection(Long senderId, Long receiverId) {

        Student sender = studentRepository.findById(senderId).orElseThrow();
        Student receiver = studentRepository.findById(receiverId).orElseThrow();

        Optional<ConnectionRequest> req1 =
                connectionRequestRepository.findTopBySender_IdAndReceiver_IdOrderByCreatedAtDesc(
                        senderId, receiverId
                );

        Optional<ConnectionRequest> req2 =
                connectionRequestRepository.findTopBySender_IdAndReceiver_IdOrderByCreatedAtDesc(
                        receiverId, senderId
                );

        ConnectionRequest lastReq = req1.orElse(req2.orElse(null));

        if (lastReq != null) {
            switch (lastReq.getStatus()) {
                case ACCEPTED:
                    throw new RuntimeException("Already connected.");
                case PENDING:
                    throw new RuntimeException("Request already pending.");
                case REJECTED:
                    break;
            }
        }

        ConnectionRequest newReq = ConnectionRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(RequestStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        return connectionRequestRepository.save(newReq);
    }

    @Override
    public ConnectionRequest respondConnection(Long requestId, RequestStatus status, Long userId) {

        ConnectionRequest req = connectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!req.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("You cannot respond to someone else's request.");
        }

        req.setStatus(status);
        req.setCreatedAt(Instant.now());

        return connectionRequestRepository.save(req);
    }

    @Override
    public String getConnectionStatus(Long student1, Long student2) {
        Optional<ConnectionRequest> req = 
            connectionRequestRepository.findTopByStudents(student1, student2);

        return req.map(r -> "Status: " + r.getStatus())
                .orElse("No connection history");
    }

    @Override
    @Transactional  // ✅ Added missing @Transactional
    public String removeConnection(Long student1, Long student2) {
        // ✅ Fixed: Use correct repository method name
        Optional<ConnectionRequest> existing =
                connectionRequestRepository.findConnectionBetween(student1, student2);

        if (existing.isEmpty()) {
            return "NO_CONNECTION_FOUND";
        }

        if (existing.get().getStatus() != RequestStatus.ACCEPTED) {
            return "NOT_ACCEPTED_YET";
        }

        connectionRequestRepository.deleteConnectionBetween(student1, student2);  // ✅ Now exists
        return "CONNECTION_REMOVED";
    }
    
    @Override
    @Transactional(readOnly = true)
    public MatchResponse findBestMatches(Long currentUserId, MatchRequest request) {
        List<TeachSkill> teacherSkills = teachSkillRepository.findBySkillNameIgnoreCase(request.getSkillName());
        
        List<StudentMatch> allMatches = teacherSkills.stream()
            .map(ts -> buildStudentMatch(currentUserId, ts.getStudent(), ts, request))
            .filter(match -> match.getMatchScore() >= 50.0)
            .filter(match -> !match.isAlreadyConnected())
            .filter(match -> !match.getId().equals(currentUserId))
            .sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
            .toList();

        int pageSize = Math.max(request.getSize() != null ? request.getSize() : 10, 1);
        int page = Math.max(request.getPage() != null ? request.getPage() : 0, 0);
        int fromIndex = page * pageSize;
        
        List<StudentMatch> paginatedMatches = allMatches.subList(
            Math.min(fromIndex, allMatches.size()),
            Math.min(fromIndex + pageSize, allMatches.size())
        );

        return MatchResponse.builder()
            .matches(paginatedMatches)
            .totalPages((int) Math.ceil((double) allMatches.size() / pageSize))
            .totalElements(allMatches.size())
            .currentPage(page)
            .build();
    }


    
    private StudentMatch buildStudentMatch(Long currentUserId, Student teacher, TeachSkill teachSkill, MatchRequest request) {
        double score = calculateMatchScore(teacher, teachSkill, request);
        boolean alreadyConnected = connectionRequestRepository.existsAcceptedConnection(currentUserId, teacher.getId());
        
        return StudentMatch.builder()
            .id(teacher.getId())
            .name(teacher.getName())
            .email(teacher.getEmail())
            .bio(teacher.getBio())
            .preferredMode(teacher.getPreferredMode())
            .availableTime(teacher.getAvailableTime())
            .skillName(teachSkill.getSkillName())
            .experienceLevel(teachSkill.getExperienceLevel().name())
            .matchScore(score)
            .alreadyConnected(alreadyConnected)
            .build();
    }

    private double calculateMatchScore(Student teacher, TeachSkill teachSkill, MatchRequest request) {
        double score = 40.0; // base skill match
        
        score += getExperienceScore(teachSkill.getExperienceLevel());
        if (matchesMode(request.getPreferredMode(), teacher.getPreferredMode())) score += 20.0;
        if (matchesAvailability(request.getAvailableTime(), teacher.getAvailableTime())) score += 15.0;
        if (matchesBioKeywords(request.getSkillName(), teacher.getBio())) score += 5.0;
        
        return Math.min(score, 100.0);
    }

    private double getExperienceScore(ExperienceLevel level) {
        return switch (level) {
          
            case ADVANCED -> 15.0;
            case INTERMEDIATE -> 10.0;
            case BEGINNER -> 5.0;
            default -> 0.0;
        };
    }

    private boolean matchesMode(String requestMode, String teacherMode) {
        if (requestMode == null || teacherMode == null) return false;
        return requestMode.toLowerCase().contains(teacherMode.toLowerCase()) || 
               teacherMode.toLowerCase().contains(requestMode.toLowerCase()) ||
               "both".equalsIgnoreCase(requestMode) || "both".equalsIgnoreCase(teacherMode);
    }

    private boolean matchesAvailability(String requestTime, String teacherTime) {
        if (requestTime == null || teacherTime == null) return false;
        return teacherTime.toLowerCase().contains(requestTime.toLowerCase());
    }

    private boolean matchesBioKeywords(String skill, String bio) {
        return bio != null && bio.toLowerCase().contains(skill.toLowerCase());
    }


}