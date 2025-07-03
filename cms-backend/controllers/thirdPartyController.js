const sequelize = require("../config/db");
const axios = require("axios");
const { doBoardcastNotification } = require("../utils/helpers");

exports.boardcastNotification = async (req, res) => {
  try {
    const result = await doBoardcastNotification(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error sending notification:", err);
    return res
      .status(400)
      .json({ message: err.message || "Internal server error" });
  }
};
