import express from "express";
import bcrypt from "bcryptjs";
import { getQuery, runQuery } from "../db.js";
import { generateUserToken, verifyUserToken } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/signup - User registration
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, Email, and Password are required." });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ success: false, error: "Invalid Email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await getQuery("SELECT id FROM users WHERE email = ?;", [cleanEmail]);

    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists with this Email. Please log in." });
    }

    const userId = `u_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    await runQuery(
      "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?);",
      [userId, name.trim(), cleanEmail, passwordHash]
    );

    const newUser = { id: userId, name: name.trim(), email: cleanEmail, role: "user" };
    const token = generateUserToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: newUser,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error during registration." });
  }
});

// POST /api/auth/login - User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and Password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await getQuery("SELECT * FROM users WHERE email = ?;", [cleanEmail]);

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid Email or Password." });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid Email or Password." });
    }

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = generateUserToken(userData);

    return res.json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error during login." });
  }
});

// GET /api/auth/me - Verify user session token
router.get("/me", verifyUserToken, async (req, res) => {
  try {
    const user = await getQuery("SELECT id, name, email, role, created_at FROM users WHERE id = ?;", [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, error: "User account not found." });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error fetching user profile." });
  }
});

export default router;
