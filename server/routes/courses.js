import express from "express";
import { allQuery, getQuery, runQuery } from "../db.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/courses - Public endpoint to list courses
router.get("/", async (req, res) => {
  try {
    const courses = await allQuery("SELECT * FROM courses ORDER BY created_at DESC;");
    return res.json({ success: true, courses });
  } catch (err) {
    console.error("Fetch courses error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch courses." });
  }
});

// GET /api/courses/:id - Public endpoint to get single course + videos
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await getQuery("SELECT * FROM courses WHERE id = ?;", [id]);
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found." });
    }

    const videos = await allQuery(
      "SELECT * FROM videos WHERE course_id = ? ORDER BY sequence ASC, created_at ASC;",
      [id]
    );

    return res.json({ success: true, course: { ...course, videos } });
  } catch (err) {
    console.error("Fetch course details error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch course details." });
  }
});

// POST /api/courses - Admin only: Add new course
router.post("/", verifyAdminToken, async (req, res) => {
  try {
    const { title, level, duration, description, modules, rating, accent } = req.body;

    if (!title || !level || !duration || !description) {
      return res.status(400).json({
        success: false,
        error: "Title, Level, Duration, and Description are required.",
      });
    }

    const courseId = `c_${Date.now()}`;
    await runQuery(
      `INSERT INTO courses (id, title, level, duration, description, modules, rating, accent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        courseId,
        title.trim(),
        level.trim(),
        duration.trim(),
        description.trim(),
        parseInt(modules) || 0,
        rating || "4.9",
        accent || "violet",
      ]
    );

    const newCourse = await getQuery("SELECT * FROM courses WHERE id = ?;", [courseId]);
    return res.status(201).json({
      success: true,
      message: "Course created successfully!",
      course: newCourse,
    });
  } catch (err) {
    console.error("Create course error:", err);
    return res.status(500).json({ success: false, error: "Failed to create course." });
  }
});

// PUT /api/courses/:id - Admin only: Update course
router.put("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, level, duration, description, modules, rating, accent } = req.body;

    const existing = await getQuery("SELECT id FROM courses WHERE id = ?;", [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Course not found." });
    }

    await runQuery(
      `UPDATE courses 
       SET title = ?, level = ?, duration = ?, description = ?, modules = ?, rating = ?, accent = ?
       WHERE id = ?;`,
      [
        title.trim(),
        level.trim(),
        duration.trim(),
        description.trim(),
        parseInt(modules) || 0,
        rating || "4.9",
        accent || "violet",
        id,
      ]
    );

    const updatedCourse = await getQuery("SELECT * FROM courses WHERE id = ?;", [id]);
    return res.json({
      success: true,
      message: "Course updated successfully!",
      course: updatedCourse,
    });
  } catch (err) {
    console.error("Update course error:", err);
    return res.status(500).json({ success: false, error: "Failed to update course." });
  }
});

// DELETE /api/courses/:id - Admin only: Delete course and associated videos
router.delete("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getQuery("SELECT id FROM courses WHERE id = ?;", [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Course not found." });
    }

    // Delete associated videos first (or relying on PRAGMA foreign_keys = ON)
    await runQuery("DELETE FROM videos WHERE course_id = ?;", [id]);
    await runQuery("DELETE FROM courses WHERE id = ?;", [id]);

    return res.json({
      success: true,
      message: "Course and associated videos deleted successfully!",
      deletedId: id,
    });
  } catch (err) {
    console.error("Delete course error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete course." });
  }
});

export default router;
