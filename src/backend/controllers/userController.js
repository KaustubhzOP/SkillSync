import User from "../models/User.js";
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const parseSkills = (val, defaultVal = []) => {
  if (Array.isArray(val)) {
    return val.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof val === "string" && val.trim().length > 0) {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return defaultVal;
};

// REGISTER USER
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: "Invalid input" });
  }

  try {
    const { name, email, password, role, skills, wantedSkills } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
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

    // Automatically sync registered user to Student collection
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
      userId: user._id,
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: "Invalid input" });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "mysecretkey123",
      { expiresIn: "1h" }
    );

    res.status(200).json({
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET USER PROFILE (Protected)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE USER SKILLS (Protected)
export const updateSkills = async (req, res) => {
  try {
    const { skills, wantedSkills } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (skills !== undefined) user.skills = skills;
    if (wantedSkills !== undefined) user.wantedSkills = wantedSkills;

    await user.save();

    // Synchronize changes to Student collection so website Students directory updates immediately
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

    res.status(200).json({
      message: "Skills updated successfully",
      skills: user.skills,
      wantedSkills: user.wantedSkills,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
