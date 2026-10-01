import express from "express";
import { allQuery, getQuery, runQuery } from "../db.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/faqs - Public list of FAQs
router.get("/", async (req, res) => {
  try {
    const faqs = await allQuery("SELECT * FROM faqs ORDER BY created_at ASC;");
    return res.json({ success: true, faqs });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch FAQs." });
  }
});

// POST /api/faqs - Admin add FAQ
router.post("/", verifyAdminToken, async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, error: "Question and Answer are required." });
    }

    const faqId = `f_${Date.now()}`;
    await runQuery("INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?);", [
      faqId,
      question.trim(),
      answer.trim(),
    ]);

    const newFaq = await getQuery("SELECT * FROM faqs WHERE id = ?;", [faqId]);
    return res.status(201).json({ success: true, message: "FAQ added!", faq: newFaq });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to create FAQ." });
  }
});

// DELETE /api/faqs/:id - Admin delete FAQ
router.delete("/:id", verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery("DELETE FROM faqs WHERE id = ?;", [id]);
    return res.json({ success: true, message: "FAQ deleted!", deletedId: id });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to delete FAQ." });
  }
});

export default router;
