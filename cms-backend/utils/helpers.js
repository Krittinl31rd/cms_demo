const sequelize = require("../config/db");
const axios = require("axios");

const payloadNotify = {
  data: {
    ip: null,
    room_id: null,
    message: null,
  },
  boardcast: {
    role: [],
    type: [],
  },
};

function CheckTypeTechnician(value) {
  if (!value || typeof value !== "number") return null;

  let name = "";
  switch (value) {
    case 1:
      name = "RCU";
      break;
    case 2:
      name = "Electrical";
      break;
    case 3:
      name = "Other";
      break;
    default:
      name = "Unknown Type";
  }

  return name;
}

async function doBoardcastNotification({ data, boardcast }) {
  if (!data || !data.message || (!data.ip && !data.room_id)) {
    throw new Error("Notification data is required");
  }

  let userIds = [];

  if (boardcast.role && boardcast.role.length > 0) {
    const usersByRole = await sequelize.query(
      `SELECT id FROM users WHERE role_id IN (:role_ids)`,
      {
        replacements: { role_ids: boardcast.role },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    userIds.push(...usersByRole.map((u) => u.id));
  }

  if (boardcast.type && boardcast.type.length > 0) {
    const usersByType = await sequelize.query(
      `SELECT user_id FROM technician WHERE type_id IN (:type_ids)`,
      {
        replacements: { type_ids: boardcast.type },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    userIds.push(...usersByType.map((t) => t.user_id));
  }

  userIds = [...new Set(userIds)];

  if (userIds.length === 0) {
    throw new Error("No target users found");
  }

  const onesignalUsers = await sequelize.query(
    `SELECT subscribe_id
     FROM onesignal
     WHERE user_id IN (:user_ids) AND is_login = 1 AND expires_at > NOW() + INTERVAL 7 HOUR`,
    {
      replacements: { user_ids: userIds },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const subscribeId = onesignalUsers.map((user) => user.subscribe_id);

  if (subscribeId.length === 0) {
    throw new Error("No OneSignal subscriptions found");
  }

  let isRoom;
  if (data.ip != null) {
    [isRoom] = await sequelize.query(
      `SELECT * FROM rooms WHERE ip_address = :ip_address`,
      {
        replacements: { ip_address: data.ip },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  } else if (data.room_id != null) {
    [isRoom] = await sequelize.query(
      `SELECT * FROM rooms WHERE id = :room_id`,
      {
        replacements: { room_id: data.room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  if (!isRoom) {
    throw new Error("Room not found");
  }

  const bodyOneSignal = {
    app_id: process.env.ONESIGNAL_APP_ID,
    headings: { en: "CMS System" },
    contents: {
      en: `Room ${isRoom.floor}${isRoom.room_number} - ${data.message} \nPlease check the room for more details.`,
    },
    include_subscription_ids: subscribeId,
  };

  const response = await axios.post(process.env.ONESIGNAL_URL, bodyOneSignal, {
    headers: {
      Authorization: `Bearer ${process.env.ONESIGNAL_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return {
    message: "Notification sent successfully",
    response: response.data,
  };
}

module.exports = {
  CheckTypeTechnician,
  doBoardcastNotification,
  payloadNotify,
};
