import express from "express";
import { allQuery, getQuery, runQuery } from "../db.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/leads - Submit Student Query / Counselling Form (Public)
router.post("/", async (req, res) => {
  try {
    const { fullName, phone, email, track, level, query } = req.body;

    if (!fullName || !phone || !email || !query) {
      return res.status(400).json({
        success: false,
        error: "Full Name, Phone Number, Email, and Query Message are required.",
      });
    }

    const leadId = `l_${Date.now()}`;
    await runQuery(
      `INSERT INTO leads (id, full_name, phone, email, track, level, query, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending');`,
      [
        leadId,
        fullName.trim(),
        phone.trim(),
        email.trim().toLowerCase(),
        track || "Full-Stack",
        level || "Beginner",
        query.trim(),
      ]
    );

    const newLead = await getQuery("SELECT * FROM leads WHERE id = ?;", [leadId]);
    return res.status(201).json({
      success: true,
      message: "Query submitted successfully! Prashant will review your query.",
      lead: newLead,
    });
  } catch (err) {
    console.error("Submit lead error:", err);
    return res.status(500).json({ success: false, error: "Failed to submit query." });
  }
});

// GET /api/leads - Fetch all student queries (Admin Only)
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    const leads = await allQuery("SELECT * FROM leads ORDER BY created_at DESC;");
    return res.json({ success: true, leads });
  } catch (err) {
    console.error("Fetch leads error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch student queries." });
  }
});

// PUT /api/leads/:id/status - Update Query Status (Admin Only)
router.put("/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required." });
    }

    await runQuery("UPDATE leads SET status = ? WHERE id = ?;", [status, id]);
    const updated = await getQuery("SELECT * FROM leads WHERE id = ?;", [id]);

    return res.json({
      success: true,
      message: "Lead status updated!",
      lead: updated,
    });
  } catch (err) {
    console.error("Update lead status error:", err);
    return res.status(500).json({ success: false, error: "Failed to update lead status." });
  }
});

// DELETE /api/leads/:id - Delete Query (Admin Only)
router.delete("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery("DELETE FROM leads WHERE id = ?;", [id]);
    return res.json({ success: true, message: "Lead deleted successfully!", deletedId: id });
  } catch (err) {
    console.error("Delete lead error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete lead." });
  }
});

export default router;
