import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { socket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../services/api";

const DEMO_STUDENTS = [
  {
    name: "Kaustubh Patil",
    email: "kaustubh@gmail.com",
    role: "user",
    skills: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    wantedSkills: ["Python", "Machine Learning", "Docker"],
  },
  {
    name: "Priya Patel",
    email: "priya@gmail.com",
    role: "user",
    skills: ["Java", "Spring Boot", "MySQL"],
    wantedSkills: ["Flutter", "Dart", "Firebase"],
  },
  {
    name: "Aarav Sharma",
    email: "aarav@gmail.com",
    role: "user",
    skills: ["Python", "Django", "SQL"],
    wantedSkills: ["React", "TypeScript", "GraphQL"],
  },
];

function Chat() {
  const { user: authUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Current logged in student
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (_e) {
      return null;
    }
  });

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  // Registered students list
  const [students, setStudents] = useState(DEMO_STUDENTS);
  const [onlineList, setOnlineList] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(DEMO_STUDENTS[1]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [peerTyping, setPeerTyping] = useState(false);
  const [notification, setNotification] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch all registered students from API
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/students`);
        if (res.ok) {
          const data = await res.json();
          // Filter out duplicates and merge demo info
          const map = new Map();
          DEMO_STUDENTS.forEach((s) => map.set(s.email, s));
          data.forEach((s) => map.set(s.email, { ...map.get(s.email), ...s }));
          setStudents(Array.from(map.values()));
        } else {
          setStudents(DEMO_STUDENTS);
        }
      } catch (_err) {
        setStudents(DEMO_STUDENTS);
      }
    }
    loadStudents();
  }, []);

  // WebSockets event listeners
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      if (currentUser) {
        socket.emit("studentOnline", currentUser);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onOnlineUpdate(onlineUsers) {
      setOnlineList(onlineUsers);
    }

    function onReceivePrivateMessage(msg) {
      setMessages((prev) => [...prev, msg]);
      // If message is from someone not currently open, notify
      if (!selectedPeer || selectedPeer.email !== msg.senderEmail) {
        setNotification({
          title: `New message from ${msg.senderName}`,
          text: msg.text,
          fromEmail: msg.senderEmail,
        });
      }
    }

    function onPeerTyping({ senderName, isTyping }) {
      if (selectedPeer && selectedPeer.name === senderName) {
        setPeerTyping(isTyping);
      }
    }

    function onReceiveInvite({ fromStudent, skillRequested }) {
      setNotification({
        title: `Collaboration Request!`,
        text: `${fromStudent.name} wants to connect for: ${skillRequested}`,
        fromEmail: fromStudent.email,
      });
    }

    function onChatHistory(history) {
      if (Array.isArray(history)) {
        setMessages(history);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("onlineStudentsUpdate", onOnlineUpdate);
    socket.on("receivePrivateMessage", onReceivePrivateMessage);
    socket.on("chatHistory", onChatHistory);
    socket.on("peerTyping", onPeerTyping);
    socket.on("receiveInvite", onReceiveInvite);

    if (socket.connected && currentUser) {
      socket.emit("studentOnline", currentUser);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("onlineStudentsUpdate", onOnlineUpdate);
      socket.off("receivePrivateMessage", onReceivePrivateMessage);
      socket.off("chatHistory", onChatHistory);
      socket.off("peerTyping", onPeerTyping);
      socket.off("receiveInvite", onReceiveInvite);
    };
  }, [currentUser, selectedPeer]);

  // Handle peer selection and query param
  useEffect(() => {
    const peerParam = searchParams.get("peer");
    if (peerParam && students.length > 0) {
      const match = students.find((s) => s.email === peerParam);
      if (match && (!selectedPeer || selectedPeer.email !== match.email)) {
        handleSelectPeer(match);
      }
    } else if (!selectedPeer && students.length > 0) {
      // Auto-select first peer that is NOT current user
      const other = students.find((s) => !currentUser || s.email !== currentUser.email);
      if (other) handleSelectPeer(other);
    }
  }, [searchParams, students, currentUser]);

  // Compute private room ID between two students
  const getRoomId = (userA, userB) => {
    if (!userA || !userB) return null;
    const emails = [userA.email, userB.email].sort();
    return `room:${emails[0]}_${emails[1]}`;
  };

  const handleSelectPeer = (peer) => {
    if (selectedPeer && currentUser) {
      const oldRoom = getRoomId(currentUser, selectedPeer);
      socket.emit("leavePrivateRoom", { roomId: oldRoom, student: currentUser });
    }

    setSelectedPeer(peer);
    setMessages([]);
    setPeerTyping(false);

    if (currentUser && peer) {
      const newRoom = getRoomId(currentUser, peer);
      socket.emit("joinPrivateRoom", { roomId: newRoom, student: currentUser });

      // Fetch persisted chat history from MongoDB
      fetch(`${API_BASE_URL}/api/chat/history/${encodeURIComponent(newRoom)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data);
          }
        })
        .catch((_e) => {});
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentUser || !selectedPeer) return;

    const roomId = getRoomId(currentUser, selectedPeer);
    const messagePayload = {
      roomId,
      senderId: currentUser.id || currentUser._id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("sendPrivateMessage", messagePayload);
    socket.emit("typing", { roomId, senderName: currentUser.name, isTyping: false });
    setInputMessage("");
  };

  // Handle typing indicator
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (!currentUser || !selectedPeer) return;

    const roomId = getRoomId(currentUser, selectedPeer);
    socket.emit("typing", { roomId, senderName: currentUser.name, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { roomId, senderName: currentUser.name, isTyping: false });
    }, 1500);
  };

  // Send skill swap invite
  const handleSendInvite = (skill) => {
    if (!currentUser || !selectedPeer) return;
    socket.emit("sendInvite", {
      toEmail: selectedPeer.email,
      fromStudent: currentUser,
      skillRequested: skill || "General Skill Collaboration",
    });

    const roomId = getRoomId(currentUser, selectedPeer);
    const inviteMsg = {
      roomId,
      senderId: currentUser.id || currentUser._id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      text: `Collaboration invitation to exchange skills in: "${skill || "Skill Collaboration"}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    socket.emit("sendPrivateMessage", inviteMsg);
  };

  const isPeerOnline = (email) => {
    return onlineList.some((u) => u.email === email);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Real-time Notification Banner */}
      {notification && (
        <div className="bg-blue-600 text-white px-6 py-2.5 flex items-center justify-between shadow-md transition animate-fade-in">
          <div>
            <p className="font-bold text-sm">{notification.title}</p>
            <p className="text-xs text-blue-100">{notification.text}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const target = students.find((s) => s.email === notification.fromEmail);
                if (target) handleSelectPeer(target);
                setNotification(null);
              }}
              className="bg-white text-blue-700 text-xs px-3 py-1 rounded font-semibold hover:bg-blue-50 transition"
            >
              Open
            </button>
            <button
              onClick={() => setNotification(null)}
              className="text-white hover:text-blue-200 text-xs px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Banner: Header & Account Switcher */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Inbox
            </h1>
            <p className="text-xs text-slate-500">Student messaging & collaboration</p>
          </div>

          {/* Current Student Credentials */}
          <div className="flex items-center gap-3 text-xs">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium hidden sm:inline">Logged in as:</span>
                <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="font-bold text-blue-800">{currentUser.name}</span>
                  <span className="text-blue-500">({currentUser.email})</span>
                  {currentUser.role && (
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold uppercase text-[10px] ${
                        currentUser.role === "admin"
                          ? "bg-purple-200 text-purple-900 border border-purple-300"
                          : "bg-blue-200 text-blue-900"
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-medium">
                  Not logged in
                </span>
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-semibold transition shadow-xs"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="max-w-7xl mx-auto w-full flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-145">
        {/* Left Column: Student Directory */}
        <div className="md:col-span-4 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 text-sm flex items-center justify-between">
              <span>Students</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                {onlineList.length} Online
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a peer student with different credentials to collaborate.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {students.map((student) => {
              const isMe = currentUser?.email === student.email;
              const isSelected = selectedPeer?.email === student.email;
              const online = isPeerOnline(student.email);

              return (
                <div
                  key={student.email}
                  onClick={() => !isMe && handleSelectPeer(student)}
                  className={`p-3 rounded-xl transition cursor-pointer flex items-start gap-3 my-1 ${
                    isSelected
                      ? "bg-blue-50/80 border border-blue-200 shadow-xs"
                      : isMe
                      ? "opacity-50 cursor-default bg-slate-50/50"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                        student.name.startsWith("K")
                          ? "bg-linear-to-tr from-blue-600 to-indigo-500"
                          : student.name.startsWith("P")
                          ? "bg-linear-to-tr from-emerald-600 to-teal-500"
                          : "bg-linear-to-tr from-amber-600 to-orange-500"
                      }`}
                    >
                      {student.name.charAt(0)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        online ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      title={online ? "Online via WebSockets" : "Offline"}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {student.name} {isMe && <span className="text-xs text-blue-600 font-normal">(You)</span>}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          online ? "text-emerald-700 bg-emerald-50" : "text-slate-400"
                        }`}
                      >
                        {online ? "Online" : "Offline"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate">{student.email}</p>

                    {/* Skill Tags */}
                    {student.skills && student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {student.skills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {student.skills.length > 2 && (
                          <span className="text-[10px] text-slate-400">
                            +{student.skills.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Private Chat Box */}
        <div className="md:col-span-8 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {selectedPeer ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {selectedPeer.name.charAt(0)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isPeerOnline(selectedPeer.email) ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {selectedPeer.name}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isPeerOnline(selectedPeer.email)
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isPeerOnline(selectedPeer.email) ? "Active Now" : "Offline"}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">{selectedPeer.email}</p>
                  </div>
                </div>

                {/* Quick Skill Collaboration Actions */}
                {selectedPeer.skills && selectedPeer.skills.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-slate-400">Request:</span>
                    {selectedPeer.skills.map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendInvite(skill)}
                        className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md transition"
                        title={`Send real-time collaboration invite for ${skill}`}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/30 min-h-87.5 max-h-120">
                <div className="text-center my-3">
                  <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full border border-slate-200">
                    Direct conversation between{" "}
                    <strong>{currentUser?.name || "Student"}</strong> and{" "}
                    <strong>{selectedPeer.name}</strong>
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-sm font-medium">No messages yet.</p>
                    <p className="text-xs mt-1">
                      Say hello to {selectedPeer.name} to start exchanging skills!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSender = msg.senderEmail === currentUser?.email;
                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                          {isSender ? "You" : msg.senderName} • {msg.timestamp}
                        </span>
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                            isSender
                              ? "bg-blue-600 text-white rounded-br-xs"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Peer Typing Indicator */}
                {peerTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span>{selectedPeer.name} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box or Sign In Prompt */}
              {currentUser ? (
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`Message ${selectedPeer.name}...`}
                    value={inputMessage}
                    onChange={handleInputChange}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-sm"
                  >
                    Send
                  </button>
                </form>
              ) : (
                <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 px-5">
                  <span>Sign in with your credentials to message {selectedPeer.name}.</span>
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-semibold transition shadow-xs"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <h3 className="font-bold text-slate-700 text-lg">Select a Student</h3>
              <p className="text-sm max-w-sm mt-1">
                Choose a student from the directory on the left to start a conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
