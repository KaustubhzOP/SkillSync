import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../services/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newOfferedSkill, setNewOfferedSkill] = useState("");
  const [newWantedSkill, setNewWantedSkill] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

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
      } catch (_err) {
        // Fallback to local user
        try {
          const stored = localStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
        } catch (_e) {}
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  // Sync skills with backend
  async function syncSkills(updatedSkills, updatedWantedSkills) {
    if (!token) return;
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
      if (!response.ok) throw new Error("Failed to update skills");
    } catch (err) {
      alert("Error saving skills: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Add Offered Skill
  const handleAddOfferedSkill = (e) => {
    e.preventDefault();
    if (!newOfferedSkill.trim() || !user) return;
    const skillName = newOfferedSkill.trim();
    if (user.skills && user.skills.includes(skillName)) return;

    const updatedSkills = [...(user.skills || []), skillName];
    setUser({ ...user, skills: updatedSkills });
    setNewOfferedSkill("");
    syncSkills(updatedSkills, user.wantedSkills || []);
  };

  // Remove Offered Skill
  const handleRemoveOfferedSkill = (skillToRemove) => {
    if (!user) return;
    const updatedSkills = (user.skills || []).filter((s) => s !== skillToRemove);
    setUser({ ...user, skills: updatedSkills });
    syncSkills(updatedSkills, user.wantedSkills || []);
  };

  // Add Wanted Skill
  const handleAddWantedSkill = (e) => {
    e.preventDefault();
    if (!newWantedSkill.trim() || !user) return;
    const skillName = newWantedSkill.trim();
    if (user.wantedSkills && user.wantedSkills.includes(skillName)) return;

    const updatedWanted = [...(user.wantedSkills || []), skillName];
    setUser({ ...user, wantedSkills: updatedWanted });
    setNewWantedSkill("");
    syncSkills(user.skills || [], updatedWanted);
  };

  // Remove Wanted Skill
  const handleRemoveWantedSkill = (skillToRemove) => {
    if (!user) return;
    const updatedWanted = (user.wantedSkills || []).filter((s) => s !== skillToRemove);
    setUser({ ...user, wantedSkills: updatedWanted });
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
