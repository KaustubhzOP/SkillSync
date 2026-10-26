import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Student from "./models/Student.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

async function seedDatabase() {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/skillsync";

  try {
    try {
      await mongoose.connect(primaryUri);
      console.log("Connected to MongoDB Atlas for seeding...");
    } catch (atlasErr) {
      console.log("Atlas connection failed, connecting to Local MongoDB...");
      await mongoose.connect(fallbackUri);
      console.log("Connected to Local MongoDB for seeding...");
    }

    // Sample students data
    const sampleStudents = [
      {
        name: "Kaustubh Patil",
        email: "kaustubh.patil@example.com",
        skills: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
        wantedSkills: ["Python", "Machine Learning", "Docker"],
      },
      {
        name: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        skills: ["Python", "Django", "SQL"],
        wantedSkills: ["React", "TypeScript", "GraphQL"],
      },
      {
        name: "Priya Patel",
        email: "priya.patel@example.com",
        skills: ["Java", "Spring Boot", "MySQL"],
        wantedSkills: ["Flutter", "Dart", "Firebase"],
      },
      {
        name: "Rohan Verma",
        email: "rohan.verma@example.com",
        skills: ["UI/UX Design", "Figma", "HTML/CSS"],
        wantedSkills: ["Next.js", "Vue.js", "Tailwind CSS"],
      },
    ];

    await Student.deleteMany({ email: { $in: sampleStudents.map((s) => s.email) } });
    const createdStudents = await Student.insertMany(sampleStudents);
    console.log(`\nSuccessfully created ${createdStudents.length} sample student users.`);

    // Create sample auth users with hashed passwords
    const samplePassword = await bcrypt.hash("student123", 10);
    const sampleUsers = [
      {
        name: "Kaustubh Patil",
        email: "kaustubh@gmail.com",
        password: samplePassword,
        role: "user",
        skills: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
        wantedSkills: ["Python", "Machine Learning", "Docker"],
      },
      {
        name: "Priya Patel",
        email: "priya@gmail.com",
        password: samplePassword,
        role: "user",
        skills: ["Java", "Spring Boot", "MySQL"],
        wantedSkills: ["Flutter", "Dart", "Firebase"],
      },
      {
        name: "Aarav Sharma",
        email: "aarav@gmail.com",
        password: samplePassword,
        role: "user",
        skills: ["Python", "Django", "SQL"],
        wantedSkills: ["React", "TypeScript", "GraphQL"],
      },
    ];

    await User.deleteMany({ email: { $in: sampleUsers.map((u) => u.email) } });
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Successfully created ${createdUsers.length} student auth users for testing.`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
