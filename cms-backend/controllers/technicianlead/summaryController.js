const sequelize = require("../../config/db");
const upload = require("../../middleware/uploadImage");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const {
  getWsClientByUserId,
  sendWsMessageToAll,
  sendWsMessageToUser,
  sendWsMessageToRole,
  sendWsMessageToModbusClient,
} = require("../../utils/ws/wsClients");
const {
  checkExists,
  getMaintenanceTaskBaseQuery,
  countTaskByUserId,
  getTaskWithDetailsById,
  getUpdatedFields,
} = require("../../utils/dbHelpers");
const { maintenance_status, member_role } = require("../../constants/common");
const {
  CheckTypeTechnician,
  doBoardcastNotification,
  payloadNotify,
} = require("../../utils/helpers");
const { ws_cmd } = require("../../constants/wsCommand");

exports.SummaryRoom = async (req, res) => {
  try {
    const [isOnline, isMaintenance, isTask, roomCount] = await Promise.all([
      sequelize.query(
        `SELECT is_online, COUNT(*) AS count FROM rooms GROUP BY is_online`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT status_id, COUNT(*) AS count FROM maintenance_tasks GROUP BY status_id`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(getMaintenanceTaskBaseQuery(), {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(`SELECT  COUNT(*) AS count FROM rooms`, {
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    let statusCount = {
      total_rcu: roomCount[0]?.count || 0,
      online: 0,
      offline: 0,
      rcu_fault_alert: 0,
      hi_temp_alarm: 0,
      wip: 0,
      fixed: 0,
    };

    // is_online
    isOnline.forEach((item) => {
      if (item.is_online === 1) statusCount.online = Number(item.count);
      else statusCount.offline = Number(item.count);
    });

    // status task
    isMaintenance.forEach((item) => {
      if (item.status_id === 3) statusCount.wip = Number(item.count);
      if (item.status_id === 4) statusCount.fixed = Number(item.count);
    });

    // type task
    isTask.forEach((task) => {
      if (task.assigned_to_type === 1) statusCount.rcu_fault_alert++;
      if (task.assigned_to_type === 4) statusCount.hi_temp_alarm++;
    });

    return res.status(200).json(statusCount);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetNotifications = async (req, res) => {
  try {
    const { subscribe_id } = req.params;
    const [is_sub] = await sequelize.query(
      `SELECT subscribe_id FROM onesignal WHERE user_id = :user_id AND subscribe_id = :subscribe_id`,
      {
        replacements: {
          user_id: req.user.id,
          subscribe_id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (!is_sub)
      return res.status(404).json({ message: "SubscribeId not found :)" });

    const result = await sequelize.query(
      `SELECT * FROM notifications WHERE subscribe_id = :subscribe_id ORDER BY sent_at DESC`,
      {
        replacements: { subscribe_id: is_sub.subscribe_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
