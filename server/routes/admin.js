import express from "express";
import bcrypt from "bcryptjs";
import { getQuery, runQuery } from "../db.js";
import { generateAdminToken, verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/admin/login - Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Admin Email ID and Password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await getQuery("SELECT * FROM admin WHERE gmail = ?;", [cleanEmail]);

    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid Admin Gmail ID." });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Incorrect Admin Password." });
    }

    const token = generateAdminToken({ id: admin.id, gmail: admin.gmail });

    return res.json({
      success: true,
      message: "Admin authentication successful!",
      token,
      admin: { gmail: admin.gmail, role: "admin" },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error during admin authentication." });
  }
});

// GET /api/admin/me - Verify Admin token
router.get("/me", verifyAdminToken, async (req, res) => {
  try {
    const admin = await getQuery("SELECT id, gmail, updated_at FROM admin LIMIT 1;");
    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin configuration not found." });
    }
    return res.json({ success: true, admin: { gmail: admin.gmail, role: "admin" } });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error verifying admin session." });
  }
});

// PUT /api/admin/credentials - Update Admin Email & Password securely
router.put("/credentials", verifyAdminToken, async (req, res) => {
  try {
    const { gmail, newPassword } = req.body;

    if (!gmail || !gmail.includes("@")) {
      return res.status(400).json({ success: false, error: "Valid Admin Gmail address is required." });
    }

    const cleanGmail = gmail.trim().toLowerCase();

    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 4) {
        return res.status(400).json({ success: false, error: "Password must be at least 4 characters long." });
      }
      const newHash = bcrypt.hashSync(newPassword.trim(), 10);
      await runQuery(
        "UPDATE admin SET gmail = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM admin LIMIT 1);",
        [cleanGmail, newHash]
      );
    } else {
      await runQuery(
        "UPDATE admin SET gmail = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM admin LIMIT 1);",
        [cleanGmail]
      );
    }

    // Also update contacts table admin_gmail
    await runQuery("UPDATE contacts SET admin_gmail = ? WHERE id = 1;", [cleanGmail]);

    return res.json({
      success: true,
      message: "Admin credentials updated successfully!",
      gmail: cleanGmail,
    });
  } catch (err) {
    console.error("Update credentials error:", err);
    return res.status(500).json({ success: false, error: "Failed to update admin credentials." });
  }
});

export default router;
