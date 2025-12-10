package com.web.demo.service;

import com.web.demo.model.Student;
import com.web.demo.model.*;
import com.web.demo.repository.*;
import com.web.demo.service.StudentServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
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
    public Student updateProfile(Long id, Student updates) {
        Student s = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        s.setName(updates.getName());
        s.setBio(updates.getBio());
        s.setAvailableTime(updates.getAvailableTime());
        s.setPreferredMode(updates.getPreferredMode());

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
    public String getConnectionStatus(Long user1, Long user2) {

        Optional<ConnectionRequest> req =
                connectionRequestRepository.findTopByConnection(user1, user2);

        return req.map(r -> "Status: " + r.getStatus())
                .orElse("No connection history");
    }

    @Override
    @Transactional
    public String removeConnection(Long student1, Long student2) {

        Optional<ConnectionRequest> existing =
                connectionRequestRepository.findConnectionBetween(student1, student2);

        if (existing.isEmpty()) {
            return "NO_CONNECTION_FOUND";
        }

        if (existing.get().getStatus() != RequestStatus.ACCEPTED) {
            return "NOT_ACCEPTED_YET";
        }

        connectionRequestRepository.deleteConnectionBetween(student1, student2);
        return "CONNECTION_REMOVED";
    }
}
