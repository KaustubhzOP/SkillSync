import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";

const router = express.Router();

// Helper to sanitize skills
const parseSkills = (val, defaultVal = []) => {
  if (Array.isArray(val)) {
    return val.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof val === "string" && val.trim().length > 0) {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return defaultVal;
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, skills, wantedSkills } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userSkills = parseSkills(skills, ["React", "Node.js", "MongoDB"]);
    const userWantedSkills = parseSkills(wantedSkills, ["Python", "Docker"]);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      skills: userSkills,
      wantedSkills: userWantedSkills,
    });

    // Automatically sync registered user to Student collection for immediate website display
    await Student.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        email: user.email,
        skills: user.skills,
        wantedSkills: user.wantedSkills,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        wantedSkills: user.wantedSkills,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || "mysecretkey123",
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills || [],
        wantedSkills: user.wantedSkills || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

export default router;
