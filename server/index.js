import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase } from "./db.js";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/courses.js";
import videoRoutes from "./routes/videos.js";
import leadRoutes from "./routes/leads.js";
import faqRoutes from "./routes/faqs.js";
import contactRoutes from "./routes/contacts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsers
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static directory for uploaded videos/files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/contacts", contactRoutes);

// Root health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "Skill.Nova Backend API is active and healthy!" });
});

// Global 404 Error Handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.url}` });
});

// Global Exception Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, error: err.message || "Internal Server Error" });
});

// Start DB & Express Server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 Skill.Nova Backend API running on http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize SQLite Database:", err);
    process.exit(1);
  });
