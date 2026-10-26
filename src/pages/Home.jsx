import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
          Learn. Connect. Build.
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          SkillSync helps students exchange skills and find project teammates.
        </p>

        <div className="mt-8">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold">Skill Exchange</h2>

            <p className="mt-3 text-gray-600">
              Exchange knowledge and skills with other students.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold">Find Teammates</h2>

            <p className="mt-3 text-gray-600">
              Find students with the skills you need.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold">Build Projects</h2>

            <p className="mt-3 text-gray-600">
              Create balanced teams for academic projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
