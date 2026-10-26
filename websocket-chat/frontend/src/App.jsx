import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("chatMessage", (data) => {
      setMessages((previous) => [...previous, data]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (!username.trim() || !message.trim()) {
      return;
    }

    // Send the message through Socket.IO
    // The server broadcasts it to every connected client.
    const socketMessage = {
      username: username.trim(),
      message: message.trim()
    };

    socketRef.current.emit("chatMessage", socketMessage);
    setMessage("");
  };

  return (
    <div className="chat-container">
      <h1>Real-Time Chat Application</h1>
      <p className={connected ? "online" : "offline"}>
        {connected ? "Connected" : "Connecting..."}
      </p>

      <input
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div className="messages">
        {messages.map((item, index) => (
          <p key={index}>
            <strong>{item.username}:</strong> {item.message}
          </p>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
