import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../services/api";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newOfferedSkill, setNewOfferedSkill] = useState("");
  const [newWantedSkill, setNewWantedSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");

  const token = localStorage.getItem("token");

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  // Fetch user profile on load
  useEffect(() => {
    async function fetchProfile() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setUser(data);
        if (updateUser) updateUser(data);
      } catch (_err) {
        // Fallback to local user
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
          }
        } catch (_e) {}
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  // Sync skills with backend
  async function syncSkills(updatedSkills, updatedWantedSkills) {
    if (!token) {
      showNotification("Please sign in to save your skills.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/skills`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skills: updatedSkills,
          wantedSkills: updatedWantedSkills,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update skills");
      }

      const data = await response.json();
      const updatedUser = {
        ...(user || {}),
        skills: data.skills || updatedSkills,
        wantedSkills: data.wantedSkills || updatedWantedSkills,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updateUser) updateUser(updatedUser);
      showNotification("Skills successfully updated and synced!");
    } catch (err) {
      alert("Error saving skills: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Add Offered Skill
  const handleAddOfferedSkill = (e) => {
    e.preventDefault();
    if (!token) {
      showNotification("Please sign in to add skills.");
      return;
    }
    const skillName = newOfferedSkill.trim();
    if (!skillName) return;

    const currentSkills = user?.skills || [];
    if (currentSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      showNotification(`"${skillName}" is already in your offered skills.`);
      return;
    }

    const updatedSkills = [...currentSkills, skillName];
    const updatedUser = { ...(user || {}), skills: updatedSkills };
    setUser(updatedUser);
    setNewOfferedSkill("");
    syncSkills(updatedSkills, user?.wantedSkills || []);
  };

  // Remove Offered Skill
  const handleRemoveOfferedSkill = (skillToRemove) => {
    if (!user) return;
    const updatedSkills = (user.skills || []).filter((s) => s !== skillToRemove);
    const updatedUser = { ...user, skills: updatedSkills };
    setUser(updatedUser);
    syncSkills(updatedSkills, user.wantedSkills || []);
  };

  // Add Wanted Skill
  const handleAddWantedSkill = (e) => {
    e.preventDefault();
    if (!token) {
      showNotification("Please sign in to add skills.");
      return;
    }
    const skillName = newWantedSkill.trim();
    if (!skillName) return;

    const currentWanted = user?.wantedSkills || [];
    if (currentWanted.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      showNotification(`"${skillName}" is already in your wanted skills.`);
      return;
    }

    const updatedWanted = [...currentWanted, skillName];
    const updatedUser = { ...(user || {}), wantedSkills: updatedWanted };
    setUser(updatedUser);
    setNewWantedSkill("");
    syncSkills(user?.skills || [], updatedWanted);
  };

  // Remove Wanted Skill
  const handleRemoveWantedSkill = (skillToRemove) => {
    if (!user) return;
    const updatedWanted = (user.wantedSkills || []).filter((s) => s !== skillToRemove);
    const updatedUser = { ...user, wantedSkills: updatedWanted };
    setUser(updatedUser);
    syncSkills(user.skills || [], updatedWanted);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {user ? user.name : "Student"}!
              </h1>
              {user && (
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wide ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  Role: {user.role}
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              Manage your skills, track swaps, and explore student connections.
            </p>
          </div>

          {saving && (
            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium animate-pulse">
              Saving changes...
            </span>
          )}
        </div>

        {notification && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
            <span>{notification}</span>
            <button
              onClick={() => setNotification("")}
              className="text-blue-500 hover:text-blue-700 font-bold text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {!token && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center justify-between">
            <div className="text-sm">
              <span className="font-bold">Not Signed In:</span> You are browsing in guest mode. Please sign in or register to save skills to your profile and appear in the student directory.
            </div>
            <Link
              to="/login"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Sign In / Register
            </Link>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500 font-medium">Loading Dashboard...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-semibold">Active Role</p>
                <h2 className="text-2xl font-bold mt-2 text-blue-600 capitalize">
                  {user ? user.role : "Guest"}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-semibold">Skills Offered</p>
                <h2 className="text-2xl font-bold mt-2 text-purple-600">
                  {user && user.skills ? user.skills.length : 0}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-semibold">Skills Wanted</p>
                <h2 className="text-2xl font-bold mt-2 text-indigo-600">
                  {user && user.wantedSkills ? user.wantedSkills.length : 0}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-semibold">User Email</p>
                <h2 className="text-sm font-semibold mt-3 text-gray-700 truncate">
                  {user ? user.email : "Not logged in"}
                </h2>
              </div>
            </div>

            {/* Skills Offered Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
              <h2 className="text-lg font-bold text-gray-800 flex items-center justify-between">
                <span>Manage Offered Skills</span>
                <span className="text-xs font-normal text-gray-400">Skills you can teach others</span>
              </h2>

              <form onSubmit={handleAddOfferedSkill} className="flex gap-3 mt-4">
                <input
                  type="text"
                  placeholder="e.g., React, Node.js, Express"
                  value={newOfferedSkill}
                  onChange={(e) => setNewOfferedSkill(e.target.value)}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  + Add Skill
                </button>
              </form>

              <div className="flex flex-wrap gap-2.5 mt-5">
                {user && user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3.5 py-1.5 rounded-full text-sm font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveOfferedSkill(skill)}
                        className="hover:text-red-600 text-blue-400 font-bold ml-1 text-xs transition"
                        title="Remove skill"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No offered skills added yet.</p>
                )}
              </div>
            </div>

            {/* Skills Wanted Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
              <h2 className="text-lg font-bold text-gray-800 flex items-center justify-between">
                <span>Manage Wanted Skills</span>
                <span className="text-xs font-normal text-gray-400">Skills you wish to learn</span>
              </h2>

              <form onSubmit={handleAddWantedSkill} className="flex gap-3 mt-4">
                <input
                  type="text"
                  placeholder="e.g., Docker, Python, MongoDB"
                  value={newWantedSkill}
                  onChange={(e) => setNewWantedSkill(e.target.value)}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  + Add Wanted Skill
                </button>
              </form>

              <div className="flex flex-wrap gap-2.5 mt-5">
                {user && user.wantedSkills && user.wantedSkills.length > 0 ? (
                  user.wantedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-800 px-3.5 py-1.5 rounded-full text-sm font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveWantedSkill(skill)}
                        className="hover:text-red-600 text-purple-400 font-bold ml-1 text-xs transition"
                        title="Remove skill"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No wanted skills added yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
