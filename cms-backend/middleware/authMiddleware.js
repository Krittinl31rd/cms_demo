const jwt = require("jsonwebtoken");
const sequelize = require("../config/db");

exports.AuthCheck = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = parseInt(decoded.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await sequelize.query(
      `SELECT is_active FROM users WHERE id = :id`,
      {
        replacements: { id: userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user.length || user[0].is_active == 0) {
      return res.status(403).json({ message: "User is not active" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// JWT lifespan short + Refresh token
// check is_active from query DB
