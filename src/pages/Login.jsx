import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../services/api";

function Login() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    skills: "",
    wantedSkills: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const endpoint = isRegister
      ? `${API_BASE_URL}/api/auth/register`
      : `${API_BASE_URL}/api/auth/login`;

    const payload = isRegister
      ? formData
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (isRegister) {
        setSuccess("Registration successful! Now logging you in...");
        // Automatically log in or prompt to login
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.token) {
          login(loginData.user, loginData.token);
          setTimeout(() => navigate("/dashboard"), 800);
        } else {
          setIsRegister(false);
        }
      } else {
        login(data.user, data.token);
        setSuccess("Login successful! Redirecting to Dashboard...");
        setTimeout(() => navigate("/dashboard"), 800);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                !isRegister ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                isRegister ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isRegister ? "Create an Account" : "Sign In to SkillSync"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isRegister
                ? "Enter your details below to get started"
                : "Enter your credentials to access your account"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
              <span className="font-bold">Success:</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Kaustubh"
                  required
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="kaustubh@gmail.com"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                required
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="flex justify-between items-center text-xs font-semibold text-gray-600 uppercase mb-1">
                    <span>Skills You Offer</span>
                    <span className="text-gray-400 font-normal lowercase">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Node.js, Python"
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex justify-between items-center text-xs font-semibold text-gray-600 uppercase mb-1">
                    <span>Skills You Want to Learn</span>
                    <span className="text-gray-400 font-normal lowercase">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    name="wantedSkills"
                    value={formData.wantedSkills}
                    onChange={handleChange}
                    placeholder="e.g. Docker, Machine Learning, Rust"
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition shadow-md hover:shadow-lg mt-2"
            >
              {loading
                ? isRegister
                  ? "Creating Account..."
                  : "Signing in..."
                : isRegister
                ? "Sign Up"
                : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
