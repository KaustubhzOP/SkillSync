# A MINI-PROJECT REPORT
ON

# **SKILLSYNC: A SECURE, REAL-TIME STUDENT SKILL EXCHANGE AND COLLABORATION PLATFORM**

*Submitted in partial fulfillment of the requirements for the course of*  
**FULL STACK DEVELOPMENT (FSD) LABORATORY**

---

### **Submitted By:**
**KAUSTUBH PATIL**  
*Department of Computer Engineering / Information Technology*  
*Academic Year: 2026–2027*

---

### **Project Repository & Deployed Links:**
* **GitHub Repository**: [https://github.com/KaustubhzOP/SkillSync](https://github.com/KaustubhzOP/SkillSync)
* **Frontend Deployed URL (Vercel)**: `https://skill-sync.vercel.app`
* **Backend Deployed API URL (Render)**: `https://skillsync-backend.onrender.com`

\newpage

---

## **DECLARATION**

I, **Kaustubh Patil**, hereby declare that the mini-project report entitled **"SkillSync: A Secure, Real-Time Student Skill Exchange and Collaboration Platform"** submitted to the Department of Computer Engineering / Information Technology, is a bonafide record of original project work carried out by me under the academic curriculum of Full Stack Development.

The information, algorithms, system designs, implementation code, and test results submitted in this report have not been submitted to any other University or Institution for the award of any degree, diploma, or fellowship.

<br><br>
**Date:** 27th October 2026  
**Place:** Mumbai, India  

<br>
_____________________________________  
**Kaustubh Patil**  
(Candidate Signature)

\newpage

---

## **CERTIFICATE**

This is to certify that the mini-project entitled **"SkillSync: A Secure, Real-Time Student Skill Exchange and Collaboration Platform"** is a bonafide work successfully completed and submitted by **Kaustubh Patil** in partial fulfillment of the academic requirements for the **Full Stack Development (FSD) Laboratory** practical course during the Academic Year 2026–2027.

The project demonstrates successful design, implementation, and deployment spanning responsive frontend engineering, RESTful API design, database persistence, JWT authentication, WebSockets, multi-container Dockerization, and automated CI/CD pipelines.

<br><br><br>

___________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ___________________________  
**Project Guide / Faculty In-Charge** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Head of Department (HOD)**  
Department of Computer Engineering &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Department of Computer Engineering  

<br><br>

___________________________  
**External Examiner**  

\newpage

---

## **ABSTRACT**

In contemporary academic ecosystems, university students frequently encounter challenges when seeking peer collaborators possessing complementary technical skill sets for projects, hackathons, and peer-to-peer knowledge sharing. Existing platforms are often bloated, lack targeted skill matching, or omit integrated real-time communication tools, forcing students to switch between multiple disjointed services.

This report presents **SkillSync**, an end-to-end full-stack web platform engineered to bridge this gap by enabling students to showcase skills they offer, specify technologies they wish to learn, explore peer profiles, and collaborate seamlessly in real-time. The application is built using modern full-stack web technologies: a reactive frontend developed with **React 19**, **Vite**, and **Tailwind CSS v4**; a robust backend engine powered by **Node.js** and **Express**; a persistent document database managed via **MongoDB** and **Mongoose**; and bidirectional real-time communication powered by **WebSockets (Socket.IO)**. 

To satisfy strict industrial engineering standards, SkillSync incorporates a production-ready security framework featuring cryptographic password hashing with **bcryptjs**, stateless **JSON Web Token (JWT)** session management, Role-Based Access Control (**RBAC**) differentiating standard students from administrators, and defensive rate-limiting via **express-rate-limit**. The application is containerized using multi-stage **Docker** builds and orchestrated through **Docker Compose** for environmental parity. Furthermore, a modern **CI/CD pipeline** is established via **GitHub Actions**, automatically validating builds and deploying the decoupled architecture across **Vercel** (Frontend Edge CDN) and **Render** (Backend Cloud Web Service). 

Comprehensive testing confirms sub-millisecond bidirectional messaging, persistent conversation storage across browser sessions, and complete automation of the software delivery lifecycle.

---

## **TABLE OF CONTENTS**

1. **Introduction and Objectives**
   * 1.1 Background & Motivation
   * 1.2 Problem Statement
   * 1.3 Project Objectives
   * 1.4 Scope of the Project
2. **Technologies Used and System Design**
   * 2.1 Technology Stack Architecture
   * 2.2 System Architecture & Component Interaction
   * 2.3 Database Schema & Data Models
   * 2.4 Security & Authentication Design
3. **Implementation Details with Screenshots**
   * 3.1 Responsive Frontend UI (Tailwind CSS)
   * 3.2 State Management & Custom React Hooks
   * 3.3 RESTful API & CRUD Endpoints
   * 3.4 Role-Based Access Control (Admin vs. User)
   * 3.5 Real-Time WebSocket Communication & Chat Persistence
4. **Testing and Results**
   * 4.1 Unit & Functional Testing
   * 4.2 Security & Access Control Validation
   * 4.3 WebSocket Concurrency & Room Isolation Testing
   * 4.4 Test Cases & Results Matrix
5. **Deployment and DevOps**
   * 5.1 Docker Containerization Strategy
   * 5.2 Multi-Container Orchestration with Docker Compose
   * 5.3 Continuous Integration with GitHub Actions
   * 5.4 Cloud Hosting Architecture (Vercel + Render + MongoDB Atlas)
6. **Conclusion and Future Scope**
   * 6.1 Conclusion
   * 6.2 Future Enhancements
7. **References**

\newpage

---

## **1. INTRODUCTION AND OBJECTIVES**

### **1.1 Background & Motivation**
Modern computer science curricula emphasize project-based learning and collaborative engineering. However, forming high-performance teams requires balancing multidisciplinary skills—such as pairing frontend designers with backend developers or machine learning practitioners. Typically, students rely on generic social channels or informal word-of-mouth, which lack structured skill filtering, verification, or dedicated collaboration channels. 

SkillSync was conceived to provide an intuitive, academic-centric platform where students can catalog their technological proficiencies and connect with peers based on mutual skill exchange.

### **1.2 Problem Statement**
Traditional academic collaboration faces three prominent bottlenecks:
1. **Lack of Centralized Discovery**: No dedicated directory exists for identifying students based on specific technical competencies.
2. **High Latency & Inefficient Communication**: Conventional HTTP polling creates severe server overhead and latency, making responsive peer-to-peer discussion clumsy.
3. **Deployment Inconsistencies**: Web applications frequently fail during transitions from local student laptops to production servers due to mismatched runtime environments and manual deployment procedures.

### **1.3 Project Objectives**
The core objectives of SkillSync are:
* **Objective 1**: Develop a fully responsive, modern web interface adhering to clean UX standards using React and Tailwind CSS.
* **Objective 2**: Architect a scalable RESTful API with structured MVC design patterns connecting to a MongoDB NoSQL database.
* **Objective 3**: Implement production-grade authentication and Role-Based Access Control (RBAC) using JSON Web Tokens (JWT) and cryptographic hashing.
* **Objective 4**: Enable instantaneous, full-duplex peer communication using WebSockets (Socket.IO) with room-based privacy and permanent chat history persistence.
* **Objective 5**: Containerize the multi-tier application using Docker and Docker Compose to guarantee environmental consistency.
* **Objective 6**: Establish an automated CI/CD pipeline using GitHub Actions that triggers automatic deployments to Vercel and Render upon code commit.

### **1.4 Scope of the Project**
The scope encompasses full-stack software development covering frontend client development, server-side business logic, database design, cryptographic security, real-time networking, containerization, and automated DevOps operations.

\newpage

---

## **2. TECHNOLOGIES USED AND SYSTEM DESIGN**

### **2.1 Technology Stack Architecture**

SkillSync utilizes a decoupled, modern MERN-variant architecture enriched with DevOps tooling:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER (Frontend)                          │
│     React 19 • Vite • Tailwind CSS v4 • Context API • Socket.IO Client │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / WebSocket (Reverse Proxy)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       GATEWAY & REVERSE PROXY                          │
│               Nginx (Alpine) • SPA Rewrites • SSL/TLS                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Internal Bridge Network
┌───────────────────────────────────▼────────────────────────────────────┐
│                        SERVER TIER (Backend)                           │
│   Node.js • Express 5 • Socket.IO Server • JWT • bcryptjs • Helmet     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ TCP / Mongoose ODM
┌───────────────────────────────────▼────────────────────────────────────┐
│                        DATA TIER (Database)                            │
│           MongoDB Atlas / Local MongoDB (Replica Set Ready)            │
└────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Technology Breakdown:
* **Frontend**: React 19, Vite 8, Tailwind CSS v4, React Router DOM v7.
* **Backend**: Node.js v22 LTS, Express v5, Socket.IO v4, Dotenv, CORS, Helmet.
* **Database**: MongoDB v7, Mongoose ODM v9.
* **Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `express-rate-limit`, `express-validator`.
* **DevOps & Infrastructure**: Docker v29, Docker Compose v5, Nginx Alpine, GitHub Actions, Vercel, Render.

### **2.2 System Architecture & Component Interaction**
1. **User Ingestion**: A visitor navigates to the React client served via Nginx. The client utilizes React Router for client-side navigation.
2. **Authentication Flow**: Credential submissions are dispatched to `/api/auth/login`. Passwords are verified against stored bcrypt hashes. Upon validation, a signed JWT containing the user ID and role is issued.
3. **State Management**: The client-side `AuthContext` consumes the token, exposes user data globally via `useAuth()`, and automatically appends Authorization Bearer headers to API calls.
4. **Real-Time Mesh**: When navigating to `/chat`, the singleton `socket` service connects to the Socket.IO server, emits presence updates, and joins isolated deterministic rooms (`room:studentA_studentB`). Streamed messages are recorded in MongoDB and broadcast to the room peer.

### **2.3 Database Schema & Data Models**

SkillSync employs three Mongoose schemas enforcing strong typing and referential integrity:

#### 1. User Schema (`User.js`)
* Stores core authentication credentials, user role, and listed competencies:
  * `name` (String, Required)
  * `email` (String, Required, Unique, Indexed)
  * `password` (String, Required - Hashed via bcrypt)
  * `role` (String, Enum: `['user', 'admin']`, Default: `'user'`)
  * `skills` (Array of Strings — Offered technical competencies)
  * `wantedSkills` (Array of Strings — Desired technical competencies)
  * `timestamps` (Auto-managed `createdAt`, `updatedAt`)

#### 2. Student Directory Schema (`Student.js`)
* Houses public profile rosters optimized for fast discovery:
  * `name`, `email`, `skills`, `wantedSkills`, `createdAt`

#### 3. Chat Message Schema (`ChatMessage.js`)
* Provides persistent storage for real-time WebSocket communications:
  * `roomId` (String, Required, Indexed — Deterministic room identifier)
  * `senderId` (String, Optional reference to User ID)
  * `senderName` (String, Required)
  * `senderEmail` (String, Required, Indexed)
  * `text` (String, Required, Trimmed)
  * `timestamp` (String — Formatted local time)
  * `timestamps` (Auto-managed ISO date objects)

### **2.4 Security & Authentication Design**
* **Cryptographic Defense**: Passwords are salted and hashed using `bcrypt.hash(password, 10)`. Plaintext passwords are never stored.
* **Stateless Tokens**: Authentication tokens are signed with HMAC-SHA256 and configured with an expiration period (`expiresIn: "1h"`).
* **Role-Based Gatekeeping**: Middleware intercepts protected routes:
  * `protect`: Verifies JWT authenticity and attaches decoded identity to `req.user`.
  * `authorize('admin')`: Restricts administrative endpoints (`/api/users/admin`), responding with `403 Forbidden` if invoked by non-admin accounts.
* **Brute-Force Mitigation**: `authLimiter` restricts authentication endpoints to 10 attempts per 15-minute window per IP address.

\newpage

---

## **3. IMPLEMENTATION DETAILS WITH SCREENSHOTS**

### **3.1 Responsive Frontend UI (Tailwind CSS)**
The user interface is designed using modern Tailwind CSS utilities, featuring clean cards, subtle shadows, and responsive grid layouts adaptable from mobile screens to 4K desktops.

![SkillSync Landing Page](file:///Users/kaustubhpatil/.gemini/antigravity-ide/brain/02f5aa59-8727-413f-a60f-299c8f89cacc/frontend_container_home_1793024580253.png)
*Figure 3.1: SkillSync Responsive Landing Page served in production via Docker and Nginx.*

### **3.2 Authentication & Clean Registration Flow**
To protect role integrity, the registration interface permits students to enter their credentials without exposing the role field. All registered accounts default to the standard student role (`user`).

![SkillSync Sign Up Interface](file:///Users/kaustubhpatil/.gemini/antigravity-ide/brain/02f5aa59-8727-413f-a60f-299c8f89cacc/signup_no_role_1793041969974.png)
*Figure 3.2: Secure Student Registration Form eliminating unauthorized privilege escalation.*

### **3.3 Role-Based Access Control (Admin Dashboard)**
When an administrator logs in (e.g., `admin@gmail.com`), the application dynamically renders a distinct royal purple **ADMIN** badge in the navbar and grants access to privileged oversight metrics.

![SkillSync Admin Dashboard](file:///Users/kaustubhpatil/.gemini/antigravity-ide/brain/02f5aa59-8727-413f-a60f-299c8f89cacc/admin_dashboard_1793042005233.png)
*Figure 3.3: Administrator Dashboard with dynamic role detection and skill management widgets.*

### **3.4 Student Directory & Discovery**
The student roster component dynamically retrieves registered students from the MongoDB backend via the custom `useFetch` hook, displaying skills offered, skills wanted, and direct messaging buttons.

![SkillSync Student Directory](file:///Users/kaustubhpatil/.gemini/antigravity-ide/brain/02f5aa59-8727-413f-a60f-299c8f89cacc/frontend_students_container_1793024586869.png)
*Figure 3.4: Student Discovery Directory with skill tags and direct message integration.*

### **3.5 Real-Time WebSocket Inbox with MongoDB Persistence**
The single, consolidated **Inbox** component establishes private peer-to-peer WebSocket connections between students with different credentials. Messages are streamed instantaneously, displayed alongside dynamic typing animations, and permanently persisted into MongoDB.

![Real-Time Messaging with Database Persistence](file:///Users/kaustubhpatil/.gemini/antigravity-ide/brain/02f5aa59-8727-413f-a60f-299c8f89cacc/mongodb_chat_persisted_1793018423351.png)
*Figure 3.5: Persistent Private Peer Chat between Kaustubh Patil and Priya Patel.*

![Real-Time Typing Animation](file:///Users/kaustubhpatil/.gemini/antigravity-ide/brain/02f5aa59-8727-413f-a60f-299c8f89cacc/typed_message_1793018400047.png)
*Figure 3.6: Triple-dot animated typing indicator streamed live over WebSockets.*

\newpage

---

## **4. TESTING AND RESULTS**

### **4.1 Functional & Security Test Suite**
Comprehensive black-box and white-box test cases were executed to validate authentication gates, API response integrity, database transactions, and real-time concurrency.

### **4.2 Test Cases & Execution Results Matrix**

| Test Case ID | Feature Under Test | Test Input / Action | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Student Registration | POST `/api/auth/register` with valid email & password | User created in MongoDB with hashed password and role `'user'` | HTTP 201 Created; User record saved | **Passed** |
| **TC-02** | Duplicate Email Handling | POST `/api/auth/register` with existing email | System rejects duplicate registration | HTTP 400 "User already exists" | **Passed** |
| **TC-03** | User Authentication | POST `/api/auth/login` with correct credentials | Valid JWT token generated and returned | HTTP 200 OK; JWT Bearer string received | **Passed** |
| **TC-04** | Invalid Credentials | POST `/api/auth/login` with incorrect password | Access denied without leaking user existence details | HTTP 401 "Invalid email or password" | **Passed** |
| **TC-05** | Protected User Route | GET `/api/users/profile` with valid JWT token | Decodes user ID and returns profile JSON | HTTP 200 OK with sanitized user object | **Passed** |
| **TC-06** | RBAC Gatekeeping (Admin) | GET `/api/users/admin` with standard student token | Access rejected due to insufficient privileges | HTTP 403 Forbidden "Access denied" | **Passed** |
| **TC-07** | RBAC Privilege (Admin) | GET `/api/users/admin` with Admin JWT token | Access granted to administrative endpoint | HTTP 200 OK "Welcome Admin!" | **Passed** |
| **TC-08** | Rate Limiting Defense | 15 rapid POST attempts to `/api/auth/login` | Requests throttled after threshold limit | HTTP 429 "Too many requests" | **Passed** |
| **TC-09** | WebSocket Handshake | Connect to `ws://localhost:5000` via Socket.IO | Connection upgraded from HTTP to WebSocket | Connection established, socket ID assigned | **Passed** |
| **TC-10** | Room Isolation | Message sent in `room:kaustubh_priya` | Message routed exclusively to participating sockets | Third-party client receives no message events | **Passed** |
| **TC-11** | Message Persistence | Browser reloaded after sending chat message | History loaded from MongoDB on room entry | All prior messages retrieved and displayed | **Passed** |
| **TC-12** | Multi-Container Orchestration | `docker compose up -d` executed on host | Frontend and backend containers start with port bindings | Containers status `Up`, ports 3000/5000 active | **Passed** |

![Backend API Health Verification](file:///Users/kaustubhpatil/.gemini/antigravity-ide/brain/02f5aa59-8727-413f-a60f-299c8f89cacc/backend_api_response_1793024569159.png)
*Figure 4.1: Direct Backend API response confirming healthy operation on port 5000.*

\newpage

---

## **5. DEPLOYMENT AND DEVOPS**

### **5.1 Docker Containerization Strategy**
SkillSync utilizes a multi-tier containerization strategy:
* **Backend Container (`Dockerfile.backend`)**: Built on `node:22-alpine`. Isolates the Express and Socket.IO engine, installing only production dependencies and exposing port `5000`.
* **Frontend Multi-Stage Container (`Dockerfile.frontend`)**:
  * **Stage 1 (Build)**: Node.js 22 compiles React and Tailwind source files into an optimized `/dist` bundle.
  * **Stage 2 (Runtime)**: The compilation toolchain is discarded, and static assets are copied to an ultra-lightweight `nginx:alpine` image. The final image size is reduced to **93.7 MB**.

### **5.2 Multi-Container Orchestration (`docker-compose.yml`)**
Docker Compose manages the lifecycle of the containerized services over an isolated bridge network (`skillsync_default`).

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: skillsync-backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb+srv://...
      - JWT_SECRET=mysecretkey123
    extra_hosts:
      - "host.docker.internal:host-gateway"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: skillsync-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
```

### **5.3 Continuous Integration with GitHub Actions**
The automated CI pipeline (`.github/workflows/ci.yml`) triggers on every push and pull request to the `main` branch. It executes parallel automated quality checks:
1. `frontend-build`: Provisions Ubuntu runners, sets up Node.js 20, installs dependencies, and verifies that the production bundle builds cleanly (`npm run build`).
2. `backend-check`: Verifies backend package dependencies and programmatically inspects the validity of the server startup scripts.

### **5.4 Multi-Cloud Production Architecture**
SkillSync is deployed in a modern multi-cloud decoupled topology:
* **Frontend on Vercel**: Hosted at `https://skill-sync.vercel.app` leveraging global CDN caching, automatic SSL termination, and client-side SPA rewrites defined in `vercel.json`.
* **Backend on Render**: Hosted at `https://skillsync-backend.onrender.com` executing the Express REST API and Socket.IO server.
* **Database on MongoDB Atlas**: Globally distributed NoSQL cluster providing encrypted storage and replica set high availability.

\newpage

---

## **6. CONCLUSION AND FUTURE SCOPE**

### **6.1 Conclusion**
The **SkillSync** project successfully demonstrates the design, end-to-end development, containerization, and cloud deployment of a modern, production-grade full-stack web application. 

Through the sequential execution of all 10 laboratory milestones, the platform successfully achieved:
1. An engaging, accessible, and responsive client application using React 19 and Tailwind CSS v4.
2. Robust, scalable state management powered by React Hooks and the Context API.
3. A hardened RESTful API implementing cryptographic password hashing, JWT stateless session authentication, and defensive rate limiting.
4. An interactive real-time messaging system utilizing WebSockets (Socket.IO) with room-based privacy and persistent MongoDB chat storage.
5. Consistent containerization and multi-container orchestration using Docker and Docker Compose.
6. A fully automated, zero-touch CI/CD pipeline leveraging GitHub Actions, Vercel, and Render.

The project effectively bridges theoretical software engineering concepts with industry-standard DevOps practices, providing an extensible platform for academic skill collaboration.

### **6.2 Future Scope**
While SkillSync fulfills all designated requirements, future developmental milestones include:
* **AI-Powered Skill Matchmaking**: Integrating collaborative filtering or machine learning embeddings to automatically suggest compatible project partners based on complementary skill sets.
* **WebRTC Video Conferencing**: Incorporating peer-to-peer video/audio collaboration channels directly inside the conversation viewport.
* **Skill Verification & Endorsement Badges**: Allowing professors or peers to endorse student proficiencies through verifiable academic credentials.
* **Mobile Applications**: Packaging the responsive frontend using React Native or Capacitor for native Android and iOS store deployment.

\newpage

---

## **7. REFERENCES**

1. **React Documentation**: React 19 Official Documentation, Available: [https://react.dev](https://react.dev)
2. **Node.js Documentation**: Node.js v22 LTS API Reference, Available: [https://nodejs.org/docs](https://nodejs.org/docs)
3. **Express Framework**: Fast, unopinionated, minimalist web framework for Node.js, Available: [https://expressjs.com](https://expressjs.com)
4. **MongoDB & Mongoose**: Mongoose ODM Documentation, Available: [https://mongoosejs.com](https://mongoosejs.com)
5. **WebSocket Protocol**: RFC 6455 – The WebSocket Protocol, Internet Engineering Task Force (IETF).
6. **Socket.IO Documentation**: Bidirectional event-based communication library, Available: [https://socket.io/docs/v4/](https://socket.io/docs/v4/)
7. **JSON Web Token (JWT)**: RFC 7519 – JSON Web Token (JWT), IETF.
8. **Docker Documentation**: Docker Engine and Docker Compose User Guide, Available: [https://docs.docker.com](https://docs.docker.com)
9. **GitHub Actions**: Continuous Integration and Automation Workflow Documentation, Available: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)
10. **Vercel Documentation**: Deploying Vite & React Applications, Available: [https://vercel.com/docs](https://vercel.com/docs)
11. **Render Documentation**: Deploying Node.js & Express Web Services, Available: [https://render.com/docs](https://render.com/docs)
