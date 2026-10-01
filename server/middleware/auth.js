import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "skill_nova_super_secret_jwt_key_2026";
export const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "skill_nova_admin_secret_key_2026_xyz";

export function generateUserToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function generateAdminToken(admin) {
  return jwt.sign(
    { id: admin.id || "admin_root", gmail: admin.gmail, role: "admin" },
    ADMIN_JWT_SECRET,
    { expiresIn: "24h" }
  );
}

export function verifyUserToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Access denied. No authentication token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Authentication token expired. Please sign in again." });
    }
    return res.status(401).json({ success: false, error: "Invalid authentication token." });
  }
}

export function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Access denied. Restricted Admin authentication required." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden. Administrative privileges required." });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Admin session expired. Please log in again." });
    }
    return res.status(401).json({ success: false, error: "Invalid admin authentication token." });
  }
}
