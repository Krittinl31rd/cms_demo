const sequelize = require("../config/db");
const axios = require("axios");
const {
  doBoardcastNotification,
  CheckTypeTechnician,
} = require("../utils/helpers");
const { member_role } = require("../constants/common");
const {
  sendWsMessageToAll,
  sendWsMessageToUser,
  sendWsMessageToRole,
  sendWsMessageToModbusClient,
} = require("../utils/ws/wsClients");

exports.boardcastNotification = async (req, res) => {
  try {
    const { ip, type_technician, type_notification, message } = req.body;

    const room = await sequelize.query(
      `SELECT id, floor, room_number FROM rooms WHERE ip_address = :ip_address`,
      {
        replacements: { ip_address: ip },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!room || room.length === 0) {
      return res.status(404).json({ message: "No room found." });
    }

    const payloadNotify = {
      data: {
        room_id: room[0].id,
        type_technician,
        type_notification,
        message: `${CheckTypeTechnician(type_technician)} - ${message}`,
      },
      boardcast: {
        role: [member_role.TECHNICIAN_LEAD],
        type: [type_technician],
      },
    };

    const result = await doBoardcastNotification(payloadNotify);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error sending notification:", err);
    return res
      .status(400)
      .json({ message: err.message || "Internal server error" });
  }
};
