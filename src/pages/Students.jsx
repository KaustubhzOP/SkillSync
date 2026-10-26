import useFetch from "../hooks/useFetch";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../services/api";

function Students() {
  const { data: students, loading } = useFetch(
    `${API_BASE_URL}/api/students`
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Registered Students</h1>

        {loading ? (
          <h1 className="text-center mt-10 text-xl font-semibold text-gray-500">Loading students...</h1>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students && Array.isArray(students) && students.map((student) => (
              <div key={student._id || student.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{student.email}</p>

                {student.skills && student.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills Offered</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {student.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {student.wantedSkills && student.wantedSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skills Wanted</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {student.wantedSkills.map((skill, index) => (
                        <span key={index} className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available to Connect
                  </span>
                  <a
                    href={`/chat?peer=${encodeURIComponent(student.email)}`}
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                  >
                    Message
                  </a>
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
