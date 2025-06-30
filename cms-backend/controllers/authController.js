const sequelize = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dayjs = require("dayjs");

exports.CreateInvite = async (req, res) => {
  try {
    const { role_id, expires_at, max_uses = 1 } = req.body;
    const token = crypto.randomBytes(24).toString("hex");

    const [roleResult] = await sequelize.query(
      `SELECT name FROM roles WHERE id = :role_id`,
      {
        replacements: { role_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!roleResult || !roleResult.name) {
      return res.status(404).json({ message: "Role not found" });
    }

    await sequelize.query(
      `
    INSERT INTO invitation_tokens (token, role_id, expires_at, max_uses)
    VALUES (:token, :role_id, :expires_at, :max_uses)
    `,
      {
        replacements: { token, role_id, expires_at, max_uses },
      }
    );

    res.json({
      message: `Create link success ${process.env.FRONTEND_URL}/register/${token}`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.RevokeInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const [[invite]] = await sequelize.query(
      `SELECT * FROM invitation_tokens WHERE token = :token`,
      { replacements: { token } }
    );

    if (!invite) {
      return res.status(404).json({ message: "Invitation token not found" });
    }

    // Update status to 'revoked'
    // await sequelize.query(
    //   `UPDATE invitation_tokens SET status = 'revoked' WHERE token = :token`,
    //   { replacements: { token } }
    // );

    await sequelize.query(
      `DELETE FROM invitation_tokens WHERE token = :token`,
      { replacements: { token } }
    );

    res.status(200).json({ message: "Invitation token has been revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.Approve = async (req, res) => {
  try {
    const { id } = req.params;

    const [[pendingUser]] = await sequelize.query(
      `
    SELECT a.*, t.role_id
    FROM pending_users a
    JOIN invitation_tokens t ON a.token_id = t.id
    WHERE a.id = :id AND a.status = 'pending'
    `,
      { replacements: { id } }
    );

    if (!pendingUser) return res.status(404).json({ message: "Not found" });

    // Insert into users
    await sequelize.query(
      `
    INSERT INTO users 
      (username, email, password_hash, full_name, role_id, is_active, valid_date)
    VALUES
      (:username, :email, :password_hash, :full_name, :role_id, 1, NOW())
    `,
      {
        replacements: {
          username: pendingUser.username,
          email: pendingUser.email,
          password_hash: pendingUser.password_hash,
          full_name: pendingUser.full_name,
          role_id: pendingUser.role_id,
        },
      }
    );

    // Mark as approved
    await sequelize.query(
      `UPDATE pending_users SET status = 'approved' WHERE id = :id`,
      { replacements: { id } }
    );

    // Increment used count on token
    await sequelize.query(
      `UPDATE invitation_tokens SET used_count = used_count + 1 WHERE id = :token_id`,
      { replacements: { token_id: pendingUser.token_id } }
    );

    res.status(200).json({ message: "User approved and account created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.Reject = async (req, res) => {
  try {
    const { id } = req.params;

    const [[pendingUser]] = await sequelize.query(
      `
      SELECT * FROM pending_users
      WHERE id = :id AND status = 'pending'
      `,
      { replacements: { id } }
    );

    if (!pendingUser) {
      return res
        .status(404)
        .json({ message: "Pending user not found or already processed" });
    }

    // Mark as rejected
    await sequelize.query(
      `UPDATE pending_users SET status = 'rejected' WHERE id = :id`,
      { replacements: { id } }
    );

    res.status(200).json({ message: "User application rejected" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.RegisterWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, full_name, password } = req.body;

    const [[invite]] = await sequelize.query(
      `
    SELECT * FROM invitation_tokens 
    WHERE token = :token AND status = 'active' AND expires_at > NOW()
    `,
      { replacements: { token } }
    );
    if (!invite)
      return res.status(400).json({ message: "Invalid or expired link" });

    const password_hash = await bcrypt.hash(password, 10);

    await sequelize.query(
      `
    INSERT INTO pending_users
      (token_id, email, username, full_name, password_hash)
    VALUES
      (:token_id, :email, :username, :full_name, :password_hash)
    `,
      {
        replacements: {
          token_id: invite.id,
          email,
          username: email,
          full_name,
          password_hash,
        },
      }
    );
    res.status(200).json({ message: "submitted, awaiting approval" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.ValiDateToken = async (req, res) => {
  const { token } = req.params;

  try {
    const [[invite]] = await sequelize.query(
      `
      SELECT * FROM invitation_tokens
      WHERE token = :token
        AND status = 'active'
        AND expires_at > NOW()
        AND used_count < max_uses
      `,
      { replacements: { token } }
    );

    if (!invite) {
      return res
        .status(400)
        .json({ valid: false, message: "This link is no longer available." });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.Login = async (req, res) => {
  try {
    const { username, password, device_id, subscribe_id } = req.body;
    const querySearch = `SELECT * FROM users WHERE username=:username AND is_active = 1`;
    const results = await sequelize.query(querySearch, {
      replacements: { username },
      type: sequelize.QueryTypes.SELECT,
    });
    if (results.length == 0) {
      return res
        .status(400)
        .json({ message: "Invalid username or password or not active" });
    }

    const isMatch = await bcrypt.compare(password, results[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Get permissions per user
    //   const permQuery = `
    //   SELECT p.name FROM permissions p
    //   JOIN role_permissions rp ON rp.permission_id = p.id
    //   WHERE rp.role_id = :role_id
    // `;
    //   const perms = await sequelize.query(permQuery, {
    //     replacements: { role_id: results[0].role_id },
    //     type: sequelize.QueryTypes.SELECT,
    //   });

    //   const permissions = perms.map((p) => p.name);

    if (subscribe_id) {
      const expires_at = dayjs().add(1, "day").format("YYYY-MM-DD HH:mm:ss");
      if (device_id) {
        // login by phone device
        const user_id = results[0].id;
        const existingDevice = await sequelize.query(
          `SELECT * FROM onesignal WHERE device_id = :device_id`,
          {
            replacements: { device_id },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        if (existingDevice.length > 0) {
          await sequelize.query(
            `DELETE FROM onesignal WHERE device_id = :device_id`,
            {
              replacements: { device_id },
              type: sequelize.QueryTypes.DELETE,
            }
          );
        }

        await sequelize.query(
          `INSERT INTO onesignal (user_id, device_id, subscribe_id, type, expires_at)
      VALUES (:user_id, :device_id, :subscribe_id, :type, :expires_at)`,
          {
            replacements: {
              user_id,
              device_id,
              subscribe_id,
              type: 1,
              expires_at,
            },
            type: sequelize.QueryTypes.INSERT,
          }
        );
      } else {
        // login by web
        const user_id = results[0].id;
        await sequelize.query(
          `INSERT INTO onesignal (user_id, subscribe_id, type, expires_at)
      VALUES (:user_id, :subscribe_id, :type, :expires_at)`,
          {
            replacements: {
              user_id,
              subscribe_id,
              type: 2,
              expires_at,
            },
            type: sequelize.QueryTypes.INSERT,
          }
        );
      }
    }

    const payload = {
      id: results[0].id,
      username: results[0].username,
      email: results[0].email,
      full_name: results[0].full_name,
      role_id: results[0].role_id,
      is_active: results[0].is_active,
      permissions: [],
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) {
          return res.status(500).json({ message: "Internal server error" });
        }
        res.status(200).json({
          message: "Login successful",
          payload,
          token,
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.Logout = async (req, res) => {
  const { user_id, subscribe_id } = req.body;
  try {
    await sequelize.query(
      `UPDATE onesignal SET is_login = 0 WHERE (subscribe_id = :subscribe_id) AND is_login = 1`,
      {
        replacements: { user_id, subscribe_id },
        type: sequelize.QueryTypes.DELETE,
      }
    );
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.CreateUser = async (req, res) => {
  try {
    const { email, full_name, role_id } = req.body;
    const password = process.env.DEFAULT_PASSWORD;

    const [isUser] = await sequelize.query(
      `SELECT * FROM users WHERE email = :email`,
      {
        replacements: {
          email,
        },
      }
    );

    if (isUser.length > 0) {
      return res.status(403).json({ message: "Email is already use." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await sequelize.query(
      `
    INSERT INTO users
      (username, email, password_hash, full_name, role_id)
    VALUES
      (:username, :email, :password_hash, :full_name, :role_id)
    `,
      {
        replacements: {
          username: email,
          email: email,
          password_hash: password_hash,
          full_name: full_name,
          role_id: role_id,
        },
      }
    );
    res.status(200).json({ message: "Created user successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.IsActiveUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { is_active } = req.body;

    await sequelize.query(
      `
      UPDATE users
      SET is_active = :is_active, valid_date = NOW()
      WHERE id = :id;
      `,
      {
        replacements: { id: user_id, is_active },
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    res.status(200).json({
      message: `UserID ${user_id} ${
        is_active == 0 ? "Deactivate" : "Active"
      } Successfully.`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.DeleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [isUser] = await sequelize.query(
      `
      SELECT * FROM users where id = :id
      `,
      {
        replacements: { id: user_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!isUser) {
      return res.status(404).json({
        message: `UserID ${user_id} not found.`,
      });
    }

    await sequelize.query(
      `
      DELETE FROM users WHERE id = :id;
      `,
      {
        replacements: { id: user_id },
        type: sequelize.QueryTypes.DELETE,
      }
    );
    res.status(200).json({
      message: `UserID ${user_id} delete successfully.`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.Current = async (req, res) => {
  try {
    const query = `SELECT * FROM users WHERE id=:id`;
    const result = await sequelize.query(query, {
      replacements: { id: req.user.id },
      type: sequelize.QueryTypes.SELECT,
    });
    res
      .status(200)
      .json({ message: "Get current user successful", user: result[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
