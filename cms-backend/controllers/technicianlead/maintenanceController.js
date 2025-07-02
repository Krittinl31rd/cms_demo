const sequelize = require("../../config/db");
const upload = require("../../middleware/uploadImage");
const dayjs = require("dayjs");
const {
  checkExists,
  getMaintenanceTaskBaseQuery,
} = require("../../utils/dbHelpers");
const {
  maintenance_status,
  statusNameMap,
  member_role,
} = require("../../constants/common");

exports.GetTechnicians = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.full_name, u.email, u.role_id, t.type_id
      FROM users u
      JOIN technician t ON u.id = t.user_id
      WHERE u.role_id = :role_id
    `;
    const technicians = await sequelize.query(query, {
      replacements: { role_id: member_role.TECHNICIAN },
      type: sequelize.QueryTypes.SELECT,
    });
    return res.status(200).json(technicians);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.CreateMaintenanceTask = async (req, res) => {
  try {
    const { room_id, assigned_to, problem_description } = req.body;
    const created_by = req.user?.id || null;
    const status_id =
      assigned_to == null
        ? maintenance_status.PENDING
        : maintenance_status.ASSIGNED;
    if (!(await checkExists(sequelize, "rooms", room_id))) {
      return res.status(403).json({ message: "Room not found." });
    }
    if (assigned_to != null) {
      if (!(await checkExists(sequelize, "users", assigned_to))) {
        return res.status(403).json({ message: "Assigned user not found." });
      }
    }
    if (!(await checkExists(sequelize, "maintenance_statuses", status_id))) {
      return res.status(403).json({ message: "Invalid status ID." });
    }
    if (!(await checkExists(sequelize, "users", created_by))) {
      return res.status(403).json({ message: "Creator not found." });
    }
    await sequelize.query(
      `INSERT INTO maintenance_tasks
        (room_id, assigned_to, problem_description, status_id, created_by)
        VALUES (:room_id, :assigned_to, :problem_description, :status_id, :created_by)`,
      {
        replacements: {
          room_id,
          assigned_to,
          problem_description,
          status_id,
          created_by,
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );
    return res
      .status(201)
      .json({ message: "Maintenance task created successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetMaintenanceTask = async (req, res) => {
  try {
    const {
      room_id,
      assigned_to,
      status_id,
      started_at,
      ended_at,
      created_by,
    } = req.query;

    const baseQuery = getMaintenanceTaskBaseQuery();
    const whereClauses = [];
    const replacements = {};

    if (room_id) {
      whereClauses.push("maintenance_tasks.room_id = :room_id");
      replacements.room_id = room_id;
    }

    if (assigned_to) {
      whereClauses.push("maintenance_tasks.assigned_to = :assigned_to");
      replacements.assigned_to = assigned_to;
    }

    if (status_id) {
      const statusIds = Array.isArray(status_id)
        ? status_id
        : status_id.split(",").map((id) => Number(id.trim()));
      if (statusIds.length > 1) {
        whereClauses.push(`maintenance_tasks.status_id IN (:status_ids)`);
        replacements.status_ids = statusIds;
      } else {
        whereClauses.push("maintenance_tasks.status_id = :status_id");
        replacements.status_id = statusIds[0];
      }
    }

    if (created_by) {
      whereClauses.push("maintenance_tasks.created_by = :created_by");
      replacements.created_by = created_by;
    }

    if (started_at && ended_at) {
      whereClauses.push(
        "maintenance_tasks.ended_at BETWEEN :started_at AND :ended_at"
      );
      replacements.started_at = `${started_at} 00:00:00`;
      replacements.ended_at = `${ended_at} 23:59:59`;
    } else if (started_at) {
      whereClauses.push(
        "maintenance_tasks.ended_at BETWEEN :started_at AND :ended_at"
      );
      replacements.started_at = `${started_at} 00:00:00`;
      replacements.ended_at = `${started_at} 23:59:59`;
      // whereClauses.push("maintenance_tasks.ended_at >= :started_at");
      // replacements.started_at = `${started_at} 00:00:00`;
    } else if (ended_at) {
      whereClauses.push(
        "maintenance_tasks.ended_at BETWEEN :started_at AND :ended_at"
      );
      replacements.started_at = `${ended_at} 00:00:00`;
      replacements.ended_at = `${ended_at} 23:59:59`;
      // whereClauses.push("maintenance_tasks.ended_at <= :ended_at");
      // replacements.ended_at = `${ended_at} 23:59:59`;
    }

    let query = baseQuery;
    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += " ORDER BY maintenance_tasks.created_at DESC";

    const result = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const parsedResults = result.map((item) => ({
      ...item,
      image_report: item.image_report ? JSON.parse(item.image_report) : null,
    }));

    if (parsedResults.length == 0) {
      return res.status(404).json({ message: "No maintenance tasks found." });
    }

    res.status(200).json(parsedResults);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetMaintenanceTaskByID = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await sequelize.query(
      `SELECT
      maintenance_tasks.*,
      rooms.room_number,
      rooms.floor,
      assigned_user.full_name AS assigned_to_name,
      created_by_user.full_name AS created_by_name
    FROM maintenance_tasks
    JOIN rooms ON rooms.id = maintenance_tasks.room_id
    LEFT JOIN users AS assigned_user ON assigned_user.id = maintenance_tasks.assigned_to
    LEFT JOIN users AS created_by_user ON created_by_user.id = maintenance_tasks.created_by
    WHERE maintenance_tasks.id = :id
    ORDER BY maintenance_tasks.created_at DESC`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // If no result found, return 404
    if (!result) {
      return res.status(404).json({ message: "Maintenance task not found." });
    }

    let room = null;
    // Only fetch room_control if status is IN_PROGRESS
    if (result.status_id === maintenance_status.IN_PROGRESS) {
      const rooms = await sequelize.query(
        `SELECT * FROM smarthotel.rooms WHERE id = :id`,
        {
          replacements: { id: result.room_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      [room] = await Promise.all(
        rooms.map(async (room) => {
          const devices = await sequelize.query(
            `SELECT d.id, d.type_id, d.name, d.status_id, d.last_online, d.config
             FROM devices d
             WHERE d.room_id = :room_id
             ORDER BY d.type_id ASC`,
            {
              replacements: { room_id: room.id },
              type: sequelize.QueryTypes.SELECT,
            }
          );

          const deviceList = await Promise.all(
            devices.map(async (device) => {
              const controls = await sequelize.query(
                `SELECT ctrl.control_id, ctrl.name, ctrl.value, ctrl.last_update
                 FROM device_control ctrl
                 WHERE ctrl.device_id = :device_id AND ctrl.room_id = :room_id`,
                {
                  replacements: {
                    device_id: device.id,
                    room_id: room.id,
                  },
                  type: sequelize.QueryTypes.SELECT,
                }
              );

              return {
                device_id: device.id,
                type_id: device.type_id,
                status_id: device.status_id,
                device_name: device.name,
                last_online: device.last_online,
                config: device.config,
                controls: controls.map((ctrl) => ({
                  control_id: ctrl.control_id,
                  name: ctrl.name,
                  value: ctrl.value,
                  last_update: ctrl.last_update,
                })),
              };
            })
          );

          return {
            guest_status_id: room.guest_status_id,
            dnd_status: room.dnd_status,
            mur_status: room.mur_status,
            room_check_status: room.room_check_status,
            is_online: room.is_online,
            ip_address: room.ip_address,
            mac_address: room.mac_address,
            devices: deviceList,
          };
        })
      );
    }

    res.status(200).json({
      ...result,
      room_control: room || [null],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetMaintenanceTaskByUserID = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await sequelize.query(
      `SELECT
      maintenance_tasks.*,
      rooms.room_number,
      rooms.floor,
      rooms.is_online,
      assigned_user.full_name AS assigned_to_name,
      created_by_user.full_name AS created_by_name
    FROM maintenance_tasks
    JOIN  rooms ON rooms.id = maintenance_tasks.room_id
    LEFT JOIN users AS assigned_user ON assigned_user.id = maintenance_tasks.assigned_to
    LEFT JOIN users AS created_by_user ON created_by_user.id = maintenance_tasks.created_by
    WHERE maintenance_tasks.assigned_to = :user_id ORDER BY maintenance_tasks.created_at DESC`,
      {
        replacements: { user_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const statusCounts = {
      pending: 0,
      assigned: 0,
      in_progress: 0,
      completed: 0,
      inspected: 0,
    };

    result.forEach((item) => {
      const name = statusNameMap[item.status_id];
      if (name) statusCounts[name] += 1;
    });

    res.status(200).json({
      statusCounts,
      tasks: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateMaintenanceTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const {
      fix_description = null,
      started_at = null,
      ended_at = null,
      status_id,
    } = req.body;
    const { id, role_id } = req.user;

    if (role_id == member_role.TECHNICIAN) {
      const [taskResult] = await sequelize.query(
        `SELECT * FROM maintenance_tasks WHERE id = :task_id AND assigned_to = :assigned_to`,
        {
          replacements: { task_id, assigned_to: id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!taskResult) {
        return res.status(404).json({ message: "Maintenance task not found." });
      }
    } else {
      const [taskResult] = await sequelize.query(
        `SELECT * FROM maintenance_tasks WHERE id = :task_id`,
        {
          replacements: { task_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!taskResult) {
        return res.status(404).json({ message: "Maintenance task not found." });
      }
    }

    if (!(await checkExists(sequelize, "maintenance_statuses", status_id))) {
      return res.status(403).json({ message: "Invalid status ID." });
    }

    const image_before = req.files?.before
      ? req.files.before.map((file) => file.filename)
      : null;

    const image_after = req.files?.after
      ? req.files.after.map((file) => file.filename)
      : null;

    const updates = [];
    const replacements = { task_id, status_id };

    if (fix_description != null) {
      updates.push("fix_description = :fix_description");
      replacements.fix_description = fix_description;
    }

    if (started_at != null) {
      updates.push("started_at = :started_at");
      replacements.started_at = started_at;
    }

    if (ended_at != null) {
      updates.push("ended_at = :ended_at");
      replacements.ended_at = ended_at;
    }

    if (image_before != null) {
      updates.push("image_before = :image_before");
      replacements.image_before = JSON.stringify(image_before);
    }

    if (image_after != null) {
      updates.push("image_after = :image_after");
      replacements.image_after = JSON.stringify(image_after);
    }

    updates.push("status_id = :status_id");

    const updateQuery = `
      UPDATE maintenance_tasks
      SET ${updates.join(", ")}
      WHERE id = :task_id
    `;

    await sequelize.query(updateQuery, {
      replacements,
      type: sequelize.QueryTypes.UPDATE,
    });

    return res
      .status(200)
      .json({ message: "Maintenance task updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
