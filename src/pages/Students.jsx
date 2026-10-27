import { useState } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../services/api";

function Students() {
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: students, loading, error } = useFetch(
    `${API_BASE_URL}/api/students`
  );

  const filteredStudents = (students && Array.isArray(students))
    ? students.filter((student) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        const matchName = student.name?.toLowerCase().includes(query);
        const matchEmail = student.email?.toLowerCase().includes(query);
        const matchOffered = student.skills?.some((s) => s.toLowerCase().includes(query));
        const matchWanted = student.wantedSkills?.some((s) => s.toLowerCase().includes(query));
        return matchName || matchEmail || matchOffered || matchWanted;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Community Students & Skills</h1>
            <p className="text-gray-500 text-sm mt-1">
              Browse registered peers, find complementary skills, and start collaborating in real-time.
            </p>
          </div>

          <div className="flex gap-2.5">
            {token ? (
              <Link
                to="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm flex items-center gap-1.5"
              >
                <span>+</span> Manage My Skills
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm flex items-center gap-1.5"
              >
                <span>+</span> Join & Add Your Skills
              </Link>
            )}
          </div>
        </div>

        {/* User Status Banner */}
        {token && user ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-blue-900">
              <span className="font-bold">You are active as:</span> {user.name} ({user.email})
              <div className="flex flex-wrap gap-1 mt-1 text-xs text-blue-700">
                <span>Offered: {user.skills?.join(", ") || "None yet"}</span>
                <span className="mx-1">•</span>
                <span>Wanted: {user.wantedSkills?.join(", ") || "None yet"}</span>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="text-xs bg-white text-blue-700 border border-blue-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition whitespace-nowrap self-start sm:self-auto"
            >
              Edit in Dashboard →
            </Link>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-amber-900">
              <span className="font-bold">Want to be listed here?</span> Register a new account to publish your offered skills and find skill exchange partners.
            </div>
            <Link
              to="/login"
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3.5 py-1.5 rounded-lg transition whitespace-nowrap self-start sm:self-auto"
            >
              Sign Up Now →
            </Link>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search students by name, email, or skill (e.g. React, Python, Docker)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500 font-medium">Loading community students...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 font-medium">
            Failed to load students. Please ensure the backend is running.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500">
            <p className="text-base font-semibold">No students found matching "{searchTerm}"</p>
            <p className="text-xs text-gray-400 mt-1">Try searching for a different skill or clear your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student._id || student.id || student.email}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">{student.name}</h2>
                    {user && user.email?.toLowerCase() === student.email?.toLowerCase() && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{student.email}</p>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills Offered</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {student.skills && student.skills.length > 0 ? (
                        student.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-100"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No skills listed yet</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills Wanted</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {student.wantedSkills && student.wantedSkills.length > 0 ? (
                        student.wantedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium border border-purple-100"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No wanted skills listed</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                  </span>
                  <Link
                    to={`/chat?peer=${encodeURIComponent(student.email)}`}
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                  >
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Students;
