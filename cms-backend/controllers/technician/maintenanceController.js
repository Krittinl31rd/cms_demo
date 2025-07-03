const sequelize = require("../../config/db");
const upload = require("../../middleware/uploadImage");
const {
  checkExists,
  getMaintenanceTaskBaseQuery,
} = require("../../utils/dbHelpers");
const { maintenance_status, member_role } = require("../../constants/common");

// find user by type and count task today and yesterday, user with the least work will be selected.
exports.CreateMaintenanceTaskByType = async (req, res) => {
  try {
    const { ip, type, message } = req.body;

    // fin the user with the least work today and yesterday
    const leastBusy = await sequelize.query(
      `
      SELECT
        t.user_id,
        COUNT(m.id) AS task_count
      FROM
        technician t
      LEFT JOIN
        maintenance_tasks m ON t.user_id = m.assigned_to
        AND DATE(m.created_at) IN (CURDATE(), DATE_SUB(CURDATE(), INTERVAL 1 DAY))
        AND m.status_id IN (${maintenance_status.ASSIGNED}, ${maintenance_status.IN_PROGRESS}, ${maintenance_status.COMPLETED}, ${maintenance_status.UNRESOLVED})
      WHERE
        t.type_id = :type
      GROUP BY
        t.user_id
      ORDER BY
        task_count ASC, RAND()
      LIMIT 1
      `,
      {
        replacements: { type },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!leastBusy || leastBusy.length == 0) {
      return res
        .status(404)
        .json({ message: "No technician with task count found." });
    }

    const selectedUser = leastBusy[0].user_id;

    const room = await sequelize.query(
      `
      SELECT id FROM rooms WHERE ip_address = :ip_address
      `,
      {
        replacements: { ip_address: ip },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!room || room.length == 0) {
      return res.status(404).json({ message: "No rooms found." });
    }
    const roomId = room[0].id;

    // create maintenance task
    await sequelize.query(
      `
      INSERT INTO maintenance_tasks (room_id, assigned_to, problem_description, status_id, created_by)
      VALUES (:room_id, :assigned_to, :problem_description, 2, :created_by)
      `,
      {
        replacements: {
          room_id: roomId,
          assigned_to: selectedUser,
          problem_description: message,
          created_by: null, //null is system assigned
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    res.status(200).json({
      message: "Task created and assigned successfully.",
      assigned_to: selectedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
