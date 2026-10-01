import express from "express";
import { getQuery, runQuery } from "../db.js";
import { verifyAdminToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/contacts - Public contact links
router.get("/", async (req, res) => {
  try {
    const contacts = await getQuery("SELECT * FROM contacts WHERE id = 1;");
    return res.json({ success: true, contacts });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch contact settings." });
  }
});

// PUT /api/contacts - Admin update contacts
router.put("/", verifyAdminToken, async (req, res) => {
  try {
    const { email, adminGmail, instagram, whatsapp, phone } = req.body;

    await runQuery(
      `UPDATE contacts
       SET email = ?, admin_gmail = ?, instagram = ?, whatsapp = ?, phone = ?
       WHERE id = 1;`,
      [email, adminGmail || email, instagram, whatsapp, phone]
    );

    const updated = await getQuery("SELECT * FROM contacts WHERE id = 1;");
    return res.json({ success: true, message: "Contact settings saved!", contacts: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update contacts." });
  }
});

export default router;
