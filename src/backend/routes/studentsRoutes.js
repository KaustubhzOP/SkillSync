import express from "express";
import Student from "../models/Student.js";
import User from "../models/User.js";

const router = express.Router();

// CREATE STUDENT
router.post("/", async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// GET ALL STUDENTS (Includes all registered users and seeded students)
router.get("/", async (req, res) => {
  try {
    const [students, users] = await Promise.all([
      Student.find().lean(),
      User.find({}, "name email skills wantedSkills createdAt updatedAt").lean(),
    ]);

    // Combine by lowercase email so registered users always show on the website
    const studentMap = new Map();

    // 1. Add all documents from Student collection
    students.forEach((s) => {
      if (s.email) {
        studentMap.set(s.email.toLowerCase(), {
          _id: s._id,
          name: s.name,
          email: s.email,
          skills: s.skills || [],
          wantedSkills: s.wantedSkills || [],
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        });
      }
    });

    // 2. Overwrite / merge with registered User profiles so user updates are live
    users.forEach((u) => {
      if (u.email) {
        const existing = studentMap.get(u.email.toLowerCase());
        studentMap.set(u.email.toLowerCase(), {
          _id: u._id,
          name: u.name || existing?.name,
          email: u.email,
          skills: u.skills && u.skills.length > 0 ? u.skills : (existing?.skills || []),
          wantedSkills: u.wantedSkills && u.wantedSkills.length > 0 ? u.wantedSkills : (existing?.wantedSkills || []),
          createdAt: u.createdAt || existing?.createdAt,
          updatedAt: u.updatedAt || existing?.updatedAt,
        });
      }
    });

    // Return in reverse chronological order so newly registered users appear first!
    const result = Array.from(studentMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET STUDENT BY ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE STUDENT
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// DELETE STUDENT
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
