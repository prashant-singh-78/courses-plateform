import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { allQuery, getQuery, runQuery } from "../db.js";
import { verifyAdminToken } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "..", "uploads", "videos");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage for Video File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/") || file.mimetype.startsWith("application/")) {
      cb(null, true);
    } else {
      cb(null, true); // accept files
    }
  },
});

const router = express.Router();

// GET /api/courses/:courseId/videos - Fetch all videos for a specific course
router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await getQuery("SELECT id, title FROM courses WHERE id = ?;", [courseId]);
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found." });
    }

    const videos = await allQuery(
      "SELECT * FROM videos WHERE course_id = ? ORDER BY sequence ASC, created_at ASC;",
      [courseId]
    );

    return res.json({ success: true, courseId, videos });
  } catch (err) {
    console.error("Fetch videos error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch course videos." });
  }
});

// POST /api/courses/:courseId/videos - Admin Upload / Attach Video
router.post("/course/:courseId", verifyAdminToken, upload.single("videoFile"), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrl, sequence, status } = req.body;

    const course = await getQuery("SELECT id FROM courses WHERE id = ?;", [courseId]);
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found. Cannot attach video." });
    }

    if (!title || (!videoUrl && !req.file)) {
      return res.status(400).json({
        success: false,
        error: "Video Title and either a Video URL or uploaded Video File are required.",
      });
    }

    let finalVideoUrl = videoUrl ? videoUrl.trim() : "";
    if (req.file) {
      finalVideoUrl = `/uploads/videos/${req.file.filename}`;
    }

    const videoId = `v_${Date.now()}`;
    const seqNum = sequence ? parseInt(sequence) : 1;
    const videoStatus = status || "Active";

    await runQuery(
      `INSERT INTO videos (id, course_id, title, description, video_url, sequence, status)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [videoId, courseId, title.trim(), description ? description.trim() : "", finalVideoUrl, seqNum, videoStatus]
    );

    const newVideo = await getQuery("SELECT * FROM videos WHERE id = ?;", [videoId]);
    return res.status(201).json({
      success: true,
      message: "Video uploaded & attached to course successfully!",
      video: newVideo,
    });
  } catch (err) {
    console.error("Video upload error:", err);
    return res.status(500).json({ success: false, error: "Failed to upload video to course." });
  }
});

// PUT /api/videos/:id - Admin Edit Video
router.put("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, sequence, status } = req.body;

    const existing = await getQuery("SELECT id FROM videos WHERE id = ?;", [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Video not found." });
    }

    await runQuery(
      `UPDATE videos
       SET title = ?, description = ?, video_url = ?, sequence = ?, status = ?
       WHERE id = ?;`,
      [
        title.trim(),
        description ? description.trim() : "",
        videoUrl.trim(),
        parseInt(sequence) || 1,
        status || "Active",
        id,
      ]
    );

    const updatedVideo = await getQuery("SELECT * FROM videos WHERE id = ?;", [id]);
    return res.json({
      success: true,
      message: "Video details updated successfully!",
      video: updatedVideo,
    });
  } catch (err) {
    console.error("Update video error:", err);
    return res.status(500).json({ success: false, error: "Failed to update video." });
  }
});

// DELETE /api/videos/:id - Admin Delete Video
router.delete("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getQuery("SELECT * FROM videos WHERE id = ?;", [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Video not found." });
    }

    // If file was uploaded locally, remove from filesystem
    if (existing.video_url && existing.video_url.startsWith("/uploads/videos/")) {
      const filePath = path.join(__dirname, "..", existing.video_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Failed to delete local video file:", e);
        }
      }
    }

    await runQuery("DELETE FROM videos WHERE id = ?;", [id]);
    return res.json({
      success: true,
      message: "Video deleted successfully!",
      deletedId: id,
    });
  } catch (err) {
    console.error("Delete video error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete video." });
  }
});

export default router;
