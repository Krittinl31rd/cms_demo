const sequelize = require("../../config/db");
const { member_role } = require("../../constants/common");

exports.GetUsers = async (req, res) => {
  try {
    const query = `SELECT * FROM users WHERE role_id != ${member_role.SUPER_ADMIN}`;
    const [result] = await sequelize.query(query, {
      replacements: {},
    });
    res.status(200).json({ message: true, data: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetInvitationTokens = async (req, res) => {
  try {
    const query = `SELECT * FROM invitation_tokens`;
    const [result] = await sequelize.query(query, {
      replacements: {},
    });
    res.status(200).json({
      message: true,
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetPendingUsers = async (req, res) => {
  try {
    const query = `SELECT * FROM pending_users`;
    const [result] = await sequelize.query(query, {
      replacements: {},
    });
    res.status(200).json({
      message: true,
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetPendingUsers = async (req, res) => {
  try {
    const query = `SELECT * FROM pending_users`;
    const [result] = await sequelize.query(query, {
      replacements: {},
    });
    res.status(200).json({
      message: true,
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
