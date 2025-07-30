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
const {
  maintenance_status,
  member_role,
  technician_type,
} = require("../../constants/common");
const {
  CheckTypeTechnician,
  doBoardcastNotification,
  payloadNotify,
} = require("../../utils/helpers");
const { ws_cmd } = require("../../constants/wsCommand");

exports.SummaryRoom = async (req, res) => {
  try {
    const date = req.query.date || dayjs().format("YYYY-MM-DD");

    const [isOnline, roomCount] = await Promise.all([
      sequelize.query(
        `SELECT is_online, COUNT(*) AS count FROM rooms GROUP BY is_online`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(`SELECT COUNT(*) AS count FROM rooms`, {
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    const [pendingAssignedTasks, inProgressTasks, doneTasks] =
      await Promise.all([
        sequelize.query(
          getMaintenanceTaskBaseQuery() +
            ` WHERE maintenance_tasks.status_id IN (:status)
            AND DATE(maintenance_tasks.created_at) = :date`,
          {
            replacements: {
              status: [maintenance_status.PENDING, maintenance_status.ASSIGNED],
              date,
            },
            type: sequelize.QueryTypes.SELECT,
          }
        ),
        sequelize.query(
          getMaintenanceTaskBaseQuery() +
            ` WHERE maintenance_tasks.status_id = :status
            AND DATE(maintenance_tasks.started_at) = :date`,
          {
            replacements: {
              status: maintenance_status.IN_PROGRESS,
              date,
            },
            type: sequelize.QueryTypes.SELECT,
          }
        ),
        sequelize.query(
          getMaintenanceTaskBaseQuery() +
            ` WHERE maintenance_tasks.status_id IN (:status)
            AND DATE(maintenance_tasks.ended_at) = :date`,
          {
            replacements: {
              status: [
                maintenance_status.COMPLETED,
                maintenance_status.UNRESOLVED,
              ],
              date,
            },
            type: sequelize.QueryTypes.SELECT,
          }
        ),
      ]);

    const allTasks = [
      ...pendingAssignedTasks,
      ...inProgressTasks,
      ...doneTasks,
    ];

    let statusCount = {
      total_rcu: roomCount[0]?.count || 0,
      online: 0,
      offline: 0,
      rcu_fault_alert: 0,
      hi_temp_alarm: 0,
      wip: inProgressTasks.length,
      fixed: doneTasks.length,
    };

    isOnline.forEach((item) => {
      if (item.is_online == 1) statusCount.online = Number(item.count);
      else statusCount.offline = Number(item.count);
    });

    allTasks.forEach((task) => {
      // RCU FAULT ALERT
      if (
        task.assigned_to_type == technician_type.RCU &&
        [
          maintenance_status.PENDING,
          maintenance_status.ASSIGNED,
          maintenance_status.IN_PROGRESS,
        ].includes(task.status_id)
      ) {
        statusCount.rcu_fault_alert++;
      }

      // HI TEMP ALARM
      if (
        [technician_type.TEMPERATURE].includes(task.assigned_to_type) &&
        [
          maintenance_status.PENDING,
          maintenance_status.ASSIGNED,
          maintenance_status.IN_PROGRESS,
        ].includes(task.status_id)
      ) {
        statusCount.hi_temp_alarm++;
      }
    });

    return res.status(200).json(statusCount);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.GetNotifications = async (req, res) => {
//   try {
//     const { subscribe_id } = req.params;
//     const { date, started_at, ended_at } = req.query;

//     const [is_sub] = await sequelize.query(
//       `SELECT subscribe_id FROM onesignal WHERE user_id = :user_id AND subscribe_id = :subscribe_id`,
//       {
//         replacements: {
//           user_id: req.user.id,
//           // subscribe_id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     if (!is_sub)
//       return res.status(404).json({ message: "SubscribeId not found :)" });

//     const whereClauses = [`subscribe_id = :subscribe_id`];
//     const replacements = { subscribe_id };

//     if (date) {
//       whereClauses.push(`sent_at BETWEEN :started_at AND :ended_at`);
//       replacements.started_at = `${date} 00:00:00`;
//       replacements.ended_at = `${date} 23:59:59`;
//     }

//     const whereString = whereClauses.length
//       ? `WHERE ${whereClauses.join(" AND ")}`
//       : "";

//     const result = await sequelize.query(
//       `SELECT * FROM notifications ${whereString} ORDER BY sent_at DESC`,
//       {
//         replacements,
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.GetNotifications = async (req, res) => {
  try {
    const { date } = req.query;

    const [is_sub] = await sequelize.query(
      `SELECT subscribe_id FROM onesignal WHERE user_id = :user_id LIMIT 1`,
      {
        replacements: {
          user_id: req.user.id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!is_sub)
      return res
        .status(404)
        .json({ message: "No subscription found for user" });

    const whereClauses = [`user_id = :user_id`];
    const replacements = { user_id: req.user.id };

    if (date) {
      whereClauses.push(`sent_at BETWEEN :started_at AND :ended_at`);
      replacements.started_at = `${date} 00:00:00`;
      replacements.ended_at = `${date} 23:59:59`;
    }

    const whereString = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const result = await sequelize.query(
      `SELECT * FROM notifications ${whereString} ORDER BY sent_at DESC`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
