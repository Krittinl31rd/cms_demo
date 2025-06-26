const sequelize = require("../config/db");
const axios = require("axios");
const { member_role } = require("../constants/common");

const bodyOneSignal = {
  app_id: process.env.ONESIGNAL_APP_ID,
  contents: {
    en: "",
  },
  headings: {
    en: "Notification from CMS",
  },
  include_subscription_ids: "",
};

exports.boardcastNotification = async (req, res) => {
  const { data, boardcast } = req.body;
  try {
    const onesignalUsers = await sequelize.query(
      `SELECT o.*
       FROM onesignal o
       JOIN users u ON o.user_id = u.id
       WHERE u.role_id IN (:role_ids) AND is_login = 1 AND expires_at > NOW() +7`,
      {
        replacements: { role_ids: boardcast },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const subscribeId = onesignalUsers.map((user) => user.subscribe_id);

    if (subscribeId.length == 0) {
      return res.status(400).json({ message: "SubscribeId is required" });
    }

    if (!data) {
      return res
        .status(400)
        .json({ message: "Notification content is required" });
    }

    const [isRoom] = await sequelize.query(
      `SELECT * FROM rooms WHERE ip_address = :ip_address`,
      {
        replacements: { ip_address: data.ip },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!isRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    bodyOneSignal.contents.en = `Room ${isRoom.floor}${isRoom.room_number} - ${data.message}`;
    bodyOneSignal.include_subscription_ids = subscribeId;

    const response = await axios.post(
      "https://api.onesignal.com/notifications?c=push",
      bodyOneSignal,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONESIGNAL_TOKEN}`,
        },
      }
    );

    res.status(200).json({
      message: true,
      response: response.data,
    });
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

// const onesignalIds = await sequelize.query(
//   `SELECT onesignal_id FROM onesignal WHERE user_id = :user_id`,
//   {
//     replacements: { user_id },
//     type: sequelize.QueryTypes.SELECT,
//   }
// );

// const playerIds = onesignalIds
//   .map((row) => row.onesignal_id)
//   .filter(Boolean);

// if (playerIds.length === 0) {
//   console.log("No OneSignal IDs found for user", user_id);
//   return;
// }
