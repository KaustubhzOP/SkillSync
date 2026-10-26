import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentsRoutes.js";
import ChatMessage from "./models/ChatMessage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS for frontend
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Track online authenticated students: socket.id -> { id, name, email }
const onlineStudents = new Map();

io.on("connection", (socket) => {
  console.log(`[WebSocket] Connected: ${socket.id}`);

  // When a student identifies themselves with credentials
  socket.on("studentOnline", (studentData) => {
    if (studentData && studentData.email) {
      onlineStudents.set(socket.id, {
        socketId: socket.id,
        id: studentData.id || studentData._id,
        name: studentData.name,
        email: studentData.email,
        skills: studentData.skills || [],
      });

      console.log(`[WebSocket] Student Online: ${studentData.name} (${studentData.email})`);
      
      // Broadcast updated online students to all connected clients
      const uniqueOnline = Array.from(onlineStudents.values()).reduce((acc, curr) => {
        if (!acc.some((item) => item.email === curr.email)) {
          acc.push(curr);
        }
        return acc;
      }, []);

      io.emit("onlineStudentsUpdate", uniqueOnline);
    }
  });

  // Join a private 1-on-1 collaboration room between two students & load history
  socket.on("joinPrivateRoom", async ({ roomId, student }) => {
    socket.join(roomId);
    console.log(`[WebSocket] ${student?.name || socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit("peerJoined", { student, roomId });

    // Load saved chat history from MongoDB
    try {
      const history = await ChatMessage.find({ roomId }).sort({ createdAt: 1 }).limit(100);
      socket.emit("chatHistory", history);
    } catch (dbErr) {
      console.error("[MongoDB] Failed to retrieve chat history:", dbErr.message);
    }
  });

  // Leave private room
  socket.on("leavePrivateRoom", ({ roomId, student }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("peerLeft", { student, roomId });
  });

  // Real-time private message between the two students (Saved to MongoDB)
  socket.on("sendPrivateMessage", async (messagePayload) => {
    console.log(`[WebSocket] Message in ${messagePayload.roomId} from ${messagePayload.senderName}: "${messagePayload.text}"`);

    let savedPayload = { ...messagePayload };
    try {
      const savedDoc = await ChatMessage.create({
        roomId: messagePayload.roomId,
        senderId: messagePayload.senderId,
        senderName: messagePayload.senderName,
        senderEmail: messagePayload.senderEmail,
        text: messagePayload.text,
        timestamp: messagePayload.timestamp,
      });
      savedPayload = savedDoc.toObject();
      console.log(`[MongoDB] Chat message persisted with ID: ${savedDoc._id}`);
    } catch (saveErr) {
      console.error("[MongoDB] Error saving chat message:", saveErr.message);
    }

    io.to(messagePayload.roomId).emit("receivePrivateMessage", savedPayload);
  });

  // Real-time typing status
  socket.on("typing", ({ roomId, senderName, isTyping }) => {
    socket.to(roomId).emit("peerTyping", { senderName, isTyping });
  });

  // Real-time collaboration invitation
  socket.on("sendInvite", ({ toEmail, fromStudent, skillRequested }) => {
    // Find socket for recipient
    for (const [sId, sData] of onlineStudents.entries()) {
      if (sData.email === toEmail) {
        io.to(sId).emit("receiveInvite", { fromStudent, skillRequested, timestamp: new Date() });
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    const student = onlineStudents.get(socket.id);
    if (student) {
      console.log(`[WebSocket] Student Disconnected: ${student.name}`);
      onlineStudents.delete(socket.id);

      const uniqueOnline = Array.from(onlineStudents.values()).reduce((acc, curr) => {
        if (!acc.some((item) => item.email === curr.email)) {
          acc.push(curr);
        }
        return acc;
      }, []);

      io.emit("onlineStudentsUpdate", uniqueOnline);
    } else {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    }
  });
});

// Database Connection with Fallback
const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/fsd_jwt";

  try {
    await mongoose.connect(primaryUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("Primary MongoDB connection failed:", err.message);
    console.log("Connecting to Local MongoDB fallback...");
    try {
      await mongoose.connect(fallbackUri);
      console.log("MongoDB connected (Local)");
    } catch (localErr) {
      console.error("Local MongoDB connection error:", localErr.message);
    }
  }
};

connectDB();

// Root route (EXP NO. 6 requirement)
app.get("/", (req, res) => {
  res.send("JWT Authentication & WebSockets API is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", userRoutes); // Backward compatibility
app.use("/api/students", studentRoutes);

// Chat history retrieval endpoint
app.get("/api/chat/history/:roomId", async (req, res) => {
  try {
    const history = await ChatMessage.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
});

// Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server & WebSocket running on port ${PORT}`);
});
