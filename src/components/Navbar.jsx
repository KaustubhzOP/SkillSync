import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          SkillSync
        </Link>

        <div className="flex gap-5 items-center font-medium text-sm">
          <Link to="/" className="hover:text-blue-200 transition">Home</Link>
          <Link to="/students" className="hover:text-blue-200 transition">Students</Link>
          <Link to="/chat" className="hover:text-blue-200 transition">
            Inbox
          </Link>
          <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>

          {token ? (
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-1.5 bg-blue-700 px-2.5 py-1 rounded-full text-xs">
                  <span className="font-semibold">{user.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold uppercase text-[10px] ${
                      user.role === "admin"
                        ? "bg-purple-300 text-purple-900"
                        : "bg-blue-200 text-blue-900"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded transition shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white text-blue-600 text-xs font-semibold px-3.5 py-1.5 rounded hover:bg-blue-50 transition shadow-sm"
            >
              Sign In / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
