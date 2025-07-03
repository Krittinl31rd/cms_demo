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

// exports.boardcastNotification = async (req, res) => {
//   const { data, boardcast } = req.body;

//   try {
//     if (!data || !data.message || !data.ip) {
//       return res.status(400).json({ message: "Notification data is required" });
//     }

//     let userIds = [];

//     if (boardcast.role && boardcast.role.length > 0) {
//       const usersByRole = await sequelize.query(
//         `SELECT id FROM users WHERE role_id IN (:role_ids)`,
//         {
//           replacements: { role_ids: boardcast.role },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       userIds.push(...usersByRole.map((u) => u.id));
//     }

//     if (boardcast.type && boardcast.type.length > 0) {
//       const usersByType = await sequelize.query(
//         `SELECT user_id FROM technician WHERE type_id IN (:type_ids)`,
//         {
//           replacements: { type_ids: boardcast.type },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       userIds.push(...usersByType.map((t) => t.user_id));
//     }

//     userIds = [...new Set(userIds)];

//     if (userIds.length === 0) {
//       return res.status(400).json({ message: "No target users found" });
//     }

//     const onesignalUsers = await sequelize.query(
//       `SELECT subscribe_id
//        FROM onesignal
//        WHERE user_id IN (:user_ids) AND is_login = 1 AND expires_at > NOW() + INTERVAL 7 HOUR`,
//       {
//         replacements: { user_ids: userIds },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     const subscribeId = onesignalUsers.map((user) => user.subscribe_id);

//     if (subscribeId.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No OneSignal subscriptions found" });
//     }

//     const [isRoom] = await sequelize.query(
//       `SELECT * FROM rooms WHERE ip_address = :ip_address`,
//       {
//         replacements: { ip_address: data.ip },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     if (!isRoom) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     const bodyOneSignal = {
//       app_id: process.env.ONESIGNAL_APP_ID,
//       headings: {
//         en: "CMS System",
//       },
//       contents: {
//         en: `Room ${isRoom.floor}${isRoom.room_number} - ${data.message} \nPlease check the room for more details.`,
//       },
//       include_subscription_ids: subscribeId,
//     };

//     const response = await axios.post(
//       "https://api.onesignal.com/notifications?c=push",
//       bodyOneSignal,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.ONESIGNAL_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return res.status(200).json({
//       message: "Notification sent successfully",
//       response: response.data,
//     });
//   } catch (err) {
//     console.error("Error sending notification:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
