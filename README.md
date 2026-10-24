# 🎓 Peer Connect — Student Skill Exchange Platform

Peer Connect is a full-stack **Student Skill Exchange Platform** that helps students connect with peers who can teach the skills they want to learn.

Students can create profiles, specify the skills they can teach and the skills they want to learn, discover students with matching teaching skills, send connection requests, and build peer-to-peer learning connections.

The application uses a **React frontend** with a **Spring Boot REST API**, secured using **Spring Security and JWT authentication**.

# Video Link : 
https://youtu.be/SXl_czJu8Hk



## 🚀 Features

### 🔐 Authentication

- Student registration
- Student login
- JWT-based authentication
- Protected API endpoints
- Logout with JWT token blacklisting

After successful authentication, the JWT is used to access protected resources.

---

### 👤 Student Profiles

Each student has a customizable profile containing:

- Name
- Email
- Bio
- Preferred learning mode
  - Online
  - Offline
  - Both
- Available time
- Skills they can teach
- Skills they want to learn

Students can update their profile information and view the profiles of other students.

---

### 🎓 Teach Skills

Students can add skills they are comfortable teaching.

Each teaching skill contains:

- Skill name
- Experience level

Supported experience levels:

```text
BEGINNER
INTERMEDIATE
ADVANCED
```

Example:

```text
Java — Advanced
React — Intermediate
DSA — Advanced
```

---

### 📚 Learn Skills

Students can separately maintain skills they want to learn.

Examples:

```text
Machine Learning
UI/UX
Spring Boot
Python
React
```

This separates a student's role as a **learner** from their role as a **peer mentor**.

---

## 🎯 Skill Matching

The main matching page allows students to search for people who teach a particular skill.

Example:

```text
Student wants to learn Java
          ↓
Search "Java"
          ↓
Backend finds students teaching Java
          ↓
Current user is excluded
          ↓
Matching students are returned
          ↓
Student can view profile / connect
```

The request model contains fields for:

```text
skillName
preferredMode
availableTime
page
size
sortBy
```

The current backend implementation performs **case-insensitive exact skill matching** and excludes the current user and existing accepted connections.

---

## 🤝 Connection System

Students can connect with people they discover through skill matching.

### Connection Flow

```text
Student A
    │
    │ Send Connection Request
    ▼
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │
       ▼
Student B receives request
       │
   ┌───┴────┐
   ▼        ▼
ACCEPT    REJECT
   │        │
   ▼        ▼
ACCEPTED  REJECTED
   │
   ▼
Connected Students
```

The backend prevents duplicate active requests.

If the latest request is:

| Status | Behaviour |
|---|---|
| `PENDING` | Another request cannot be sent |
| `ACCEPTED` | Students are already connected |
| `REJECTED` | A new request can be sent |

Students can also:

- Check connection status
- View pending requests
- Accept requests
- Reject requests
- Remove an accepted connection

---

## 🔔 Connection Notifications

The matching page fetches pending connection requests and displays them through a notification section.

Students can respond directly to incoming requests by:

```text
Accept
   or
Reject
```

The notification list updates after a response is submitted.

---

## 🔐 JWT Authentication Flow

```text
┌──────────────┐
│ React Client │
└──────┬───────┘
       │
       │ Email + Password
       ▼
┌────────────────────┐
│ Spring Boot Backend│
└─────────┬──────────┘
          │
          ▼
┌──────────────────────┐
│ AuthenticationManager│
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ UserDetailsService   │
└─────────┬────────────┘
          │
          ▼
   BCrypt Verification
          │
          ▼
┌──────────────────────┐
│ JWT Token Generated  │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Token sent to React  │
└─────────┬────────────┘
          │
          ▼
 Stored in localStorage
          │
          ▼
Authorization: Bearer <JWT>
          │
          ▼
┌─────────────────────────┐
│ JwtAuthenticationFilter │
└──────────┬──────────────┘
           │
           ▼
 Protected REST Endpoints
```

The JWT stores the student's email as its subject and is signed using **HS256**.

---

## 🚪 Logout

When a student logs out:

```text
JWT
 ↓
/auth/logout
 ↓
TokenBlacklistService
 ↓
Token added to blacklist
 ↓
Future request using token
 ↓
401 Unauthorized
```

The frontend then removes the locally stored token.

---

## 🏗️ Application Architecture

```text
┌───────────────────────────────────────────┐
│                 FRONTEND                  │
│                                           │
│                  React                    │
│                                           │
│ Login / Register / Profile / Edit Profile │
│ Manage Skills / Match Students            │
└───────────────────┬───────────────────────┘
                    │
                    │ REST API + JWT
                    ▼
┌───────────────────────────────────────────┐
│                 BACKEND                   │
│                                           │
│              Spring Boot                  │
│                                           │
│  Controllers                              │
│       ↓                                   │
│  Service Layer                            │
│       ↓                                   │
│  Spring Data JPA Repositories             │
│       ↓                                   │
│  Persistent Database                      │
└───────────────────────────────────────────┘
```

## 🗃️ Core Data Model

### Student

```text
Student
├── id
├── name
├── email
├── password
├── bio
├── preferredMode
├── availableTime
├── teachSkills
└── learnSkills
```

The email is unique and the stored password is encoded.

---

### TeachSkill

```text
TeachSkill
├── id
├── skillName
├── experienceLevel
└── student
```

`experienceLevel` can be:

```text
BEGINNER
INTERMEDIATE
ADVANCED
```

---

### LearnSkill

```text
LearnSkill
├── id
├── skillName
└── student
```

---

### ConnectionRequest

```text
ConnectionRequest
├── id
├── sender
├── receiver
├── status
└── createdAt
```

Connection status can be:

```text
PENDING
ACCEPTED
REJECTED
```

---

## 🌐 REST API

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a student |
| `POST` | `/auth/login` | Login and receive JWT |
| `POST` | `/auth/logout` | Logout and blacklist JWT |

---

### Student

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/student/me` | Get current user's profile |
| `PUT` | `/student/me` | Update current user's profile |
| `GET` | `/student/current-user/teach` | Get current user's teaching skills |
| `GET` | `/student/current-user/learn` | Get current user's learning skills |
| `GET` | `/student/{id}` | View another student's profile |

---

### Skills

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/skills/teach` | Add a teaching skill |
| `POST` | `/skills/learn` | Add a learning skill |
| `POST` | `/skills/matches` | Find students teaching a skill |

---

### Connections

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/connect/send` | Send connection request |
| `POST` | `/connect/respond` | Accept or reject request |
| `GET` | `/connect/status` | Check connection status |
| `GET` | `/connect/pending-requests` | Get pending requests |
| `DELETE` | `/connect/remove` | Remove accepted connection |

---

## 🔒 Security

The application uses Spring Security with stateless JWT authentication.

Public endpoints:

```text
/auth/register
/auth/login
/error
```

Other API endpoints require authentication.




## 🔄 Complete Application Flow

```text
                ┌──────────────┐
                │   Register   │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │    Login     │
                └──────┬───────┘
                       │
                       ▼
                   JWT Token
                       │
                       ▼
                ┌──────────────┐
                │   Profile    │
                └──────┬───────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      Add Teach Skills     Add Learn Skills
             │                   │
             └─────────┬─────────┘
                       ▼
                Find Your Match
                       │
                       ▼
                Search by Skill
                       │
                       ▼
              Matching Students
                       │
                 ┌─────┴─────┐
                 ▼           ▼
            View Profile   Connect
                             │
                             ▼
                       Request Pending
                             │
                       ┌─────┴─────┐
                       ▼           ▼
                    Accept       Reject
                       │
                       ▼
                    Connected
```

---

## 📂 Project Structure

A simplified structure based on the application:

```text
peer-connect/
│
├── backend/
│   └── src/main/java/com/web/demo/
│       │
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── StudentController.java
│       │   ├── SkillController.java
│       │   └── ConnectionController.java
│       │
│       ├── dto/
│       │   ├── AuthRequest.java
│       │   ├── AuthResponse.java
│       │   ├── RegisterRequest.java
│       │   ├── MatchRequest.java
│       │   ├── MatchResponse.java
│       │   └── StudentMatch.java
│       │
│       ├── model/
│       │   ├── Student.java
│       │   ├── TeachSkill.java
│       │   ├── LearnSkill.java
│       │   ├── ConnectionRequest.java
│       │   ├── ExperienceLevel.java
│       │   └── RequestStatus.java
│       │
│       ├── repository/
│       │   ├── StudentRepository.java
│       │   ├── TeachSkillRepository.java
│       │   ├── LearnSkillRepository.java
│       │   └── ConnectionRequestRepository.java
│       │
│       ├── security/
│       │   ├── CurrentUser.java
│       │   ├── CustomUserDetailsService.java
│       │   ├── JwtAuthenticationFilter.java
│       │   ├── JwtUtil.java
│       │   ├── SecurityConfig.java
│       │   └── TokenBlacklistService.java
│       │
│       └── service/
│           ├── AuthService.java
│           ├── StudentService.java
│           └── StudentServiceImpl.java
│
└── frontend/
    └── src/
        ├── Login.jsx
        ├── Register.jsx
        ├── Profile.jsx
        ├── EditProfile.jsx
        ├── ManageSkills.jsx
        └── MainMatchPage.jsx
```
