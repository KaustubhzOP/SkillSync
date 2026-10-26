# SkillSync — Student Skill Exchange & Collaboration Platform

SkillSync is a full-stack student skill-swapping platform built with **React**, **Node.js**, **Express**, **MongoDB**, **Socket.IO**, and **Docker**. It enables students to list skills they offer, specify skills they want to learn, connect with peer students, and collaborate in real-time through WebSocket messaging.

---

## Project Structure

```
SkillSync/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow (Exp 10)
├── postman/
│   ├── EXP_NO_6_Postman_Collection.json
│   └── SkillSync_Postman_Collection.json
├── src/
│   ├── backend/                 # Node.js + Express Backend
│   │   ├── controllers/
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT auth & RBAC (Admin/User)
│   │   │   └── rateLimiter.js     # Express rate limiting
│   │   ├── models/
│   │   │   ├── ChatMessage.js     # Persistent chat schema (MongoDB)
│   │   │   ├── Student.js         # Student schema
│   │   │   └── User.js            # User credentials & skills schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Register & Login endpoints
│   │   │   ├── studentsRoutes.js  # Public students CRUD endpoints
│   │   │   └── userRoutes.js      # Protected user & admin endpoints
│   │   ├── seed.js                # Initial database seed script
│   │   └── server.js              # Express + Socket.IO server entry point
│   ├── components/
│   │   └── Navbar.jsx             # Responsive navigation bar with role badges
│   ├── context/
│   │   └── AuthContext.jsx        # Context API global auth state (Exp 3)
│   ├── hooks/
│   │   └── useFetch.js            # Reusable data-fetching custom hook (Exp 2)
│   ├── pages/
│   │   ├── Chat.jsx               # Real-time WebSocket Inbox (Exp 8)
│   │   ├── Dashboard.jsx          # User & Admin protected dashboard (Exp 6)
│   │   ├── Home.jsx               # Landing page with Tailwind UI (Exp 1)
│   │   ├── Login.jsx              # Tabbed Sign In / Sign Up form
│   │   └── Students.jsx           # Student directory & peer connect
│   ├── services/
│   │   ├── api.js                 # Centralized API base URL config (Exp 10)
│   │   └── socket.js              # Singleton Socket.IO client instance
│   ├── App.jsx                    # Route provider & AuthProvider wrapper
│   ├── index.css                  # Global Tailwind CSS styles
│   └── main.jsx                   # React root mount point
├── .dockerignore
├── .gitignore
├── docker-compose.yml             # Multi-container orchestration (Exp 9)
├── Dockerfile.backend             # Node.js backend container definition
├── Dockerfile.frontend            # Multi-stage React + Nginx build container
├── index.html                     # HTML5 entrypoint
├── nginx.conf                     # Nginx SPA rewrites & WebSocket reverse proxy
├── package.json
├── vercel.json                    # Vercel SPA rewrites configuration
└── vite.config.js
```

---

## Laboratory Experiments Summary (1 – 10)

| Exp | Title | Implementation in SkillSync |
| :---: | :--- | :--- |
| **1** | **Responsive Tailwind UI** | Responsive Home, Login, Dashboard, Students, and Inbox pages. |
| **2** | **React Hooks** | `useState`, `useEffect`, `useRef`, and reusable custom hook `useFetch()`. |
| **3** | **Context API** | `AuthContext` and `useAuth()` managing global login, user data, and role state. |
| **4** | **REST API + MongoDB** | Full CRUD operations with Mongoose schemas for Students, Users, and Chats. |
| **5** | **Secure REST APIs** | `express-validator` input validation, `express-rate-limit`, and error handling. |
| **6** | **JWT Authentication** | Password hashing (`bcryptjs`), JWT token signing, protected routes, and RBAC (`admin` vs `user`). |
| **7** | **Docker Deployment** | Standalone containerization of frontend (Nginx) and backend (Node.js). |
| **8** | **WebSockets** | Socket.IO real-time private rooms, typing indicators, presence, and MongoDB message persistence. |
| **9** | **Docker Compose** | Multi-container bridge networking, service discovery, and declarative orchestration. |
| **10** | **CI/CD Pipeline** | GitHub Actions workflow, dynamic `VITE_API_URL`, Vercel SPA routing, and Render deployment readiness. |

---

## Default Credentials

### Regular Student Account
* **Email**: `kaustubh@gmail.com` *(or `priya@gmail.com`)*
* **Password**: `123456`
* **Role**: `user`

### Administrator Account
* **Email**: `admin@gmail.com` *(or `admin@skillsync.com`)*
* **Password**: `admin123`
* **Role**: `admin`

---

## Getting Started

### 1. Local Development
```bash
# Install dependencies
npm install

# Start Backend API & WebSockets (Port 5000)
npm run server

# Start Frontend Vite Dev Server (Port 5173)
npm run dev
```

### 2. Multi-Container Docker Deployment (Exp 9)
```bash
# Build container images
docker compose build

# Start services in detached mode
docker compose up -d

# Verify container status
docker compose ps

# View logs
docker compose logs -f

# Teardown
docker compose down
```

* **Frontend**: `http://localhost:3000` (Nginx serving React SPA)
* **Backend API**: `http://localhost:5000` (Express + Socket.IO)

---

## License
MIT License. Built for Full Stack Development Laboratory Practicals.
