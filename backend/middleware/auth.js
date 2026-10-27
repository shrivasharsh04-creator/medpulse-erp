const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "medpulse_healthcare_erp_secret_2026";

// Authenticate JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No medical authentication token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired session. Please sign in again." });
  }
};

// Role-Based Authorization
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: ${req.user ? req.user.role : "Unknown"} role does not have authorization for this clinical module.`,
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET,
};
