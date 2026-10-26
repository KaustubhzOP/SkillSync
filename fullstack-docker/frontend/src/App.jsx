import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    fetch("http://localhost:5000/api")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Backend connection failed"));
  }, []);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
        marginTop: "80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>🐳</div>
      <h1 style={{ fontSize: "28px", color: "#1e293b", margin: "0 0 10px 0" }}>
        Full Stack Docker Application
      </h1>
      <p style={{ fontSize: "16px", color: "#64748b", margin: "0 0 24px 0" }}>
        Frontend: React
      </p>

      <div
        style={{
          backgroundColor: "#dcfce7",
          border: "1px solid #86efac",
          color: "#166534",
          padding: "16px 28px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        Backend Response: {message}
      </div>
    </div>
  );
}

export default App;
