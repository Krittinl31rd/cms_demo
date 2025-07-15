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
    const { room_id, problem_description, assigned_to, tech_type_id } =
      req.body;

    const isRoom = await sequelize.query(
      `SELECT * FROM maintenance_tasks WHERE room_id = :room_id AND status_id IN (${maintenance_status.PENDING}, ${maintenance_status.ASSIGNED}, ${maintenance_status.IN_PROGRESS})`,
      {
        replacements: { room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (isRoom.length > 0) {
      return res
        .status(403)
        .json({ message: "This room not complete not created." });
    }

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

    const [result] = await sequelize.query(
      `INSERT INTO maintenance_tasks
        (room_id, assigned_to, problem_description, status_id, created_by)
        VALUES (:room_id, :assigned_to, :problem_description, :status_id, :created_by)`,
      {
        replacements: {
          room_id,
          assigned_to,
          problem_description: `${CheckTypeTechnician(
            tech_type_id
          )} - ${problem_description}`,
          status_id,
          created_by,
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    try {
      payloadNotify.data.room_id = room_id;
      payloadNotify.data.message = `${CheckTypeTechnician(
        tech_type_id
      )} - ${problem_description}`;
      payloadNotify.boardcast.user_id = [assigned_to];
      await doBoardcastNotification(payloadNotify);
    } catch (err) {
      console.error("Error sending notification:", err);
    }

    if (assigned_to != null) {
      const insertedTaskId = result;
      const task = await getTaskWithDetailsById(insertedTaskId);
      const statusCounts = await countTaskByUserId(assigned_to);

      sendWsMessageToUser(assigned_to, {
        cmd: ws_cmd.NEW_TASK,
        param: {
          statusCounts: statusCounts,
          task: {
            ...task,
            image_before: [],
            image_after: [],
          },
        },
      });

      sendWsMessageToRole(member_role.TECHNICIAN_LEAD, {
        cmd: ws_cmd.NEW_TASK,
        param: {
          statusCounts: statusCounts,
          task: {
            ...task,
            image_before: [],
            image_after: [],
          },
        },
      });
    }

    return res
      .status(200)
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

    let statusIds = [];
    if (status_id) {
      statusIds = Array.isArray(status_id)
        ? status_id
        : status_id.split(",").map((id) => Number(id.trim()));
    }

    if (created_by) {
      whereClauses.push("maintenance_tasks.created_by = :created_by");
      replacements.created_by = created_by;
    }

    if (statusIds.length > 1) {
      let allResults = [];
      for (const sid of statusIds) {
        const localWhere = [
          ...whereClauses,
          "maintenance_tasks.status_id = :sid",
        ];
        const localReplacements = { ...replacements, sid };

        let dateField = null;
        if (
          [maintenance_status.PENDING, maintenance_status.ASSIGNED].includes(
            sid
          )
        )
          dateField = "created_at";
        else if (sid == maintenance_status.IN_PROGRESS)
          dateField = "started_at";
        else if (
          [
            maintenance_status.COMPLETED,
            maintenance_status.UNRESOLVED,
          ].includes(sid)
        )
          dateField = "ended_at";

        if ((started_at || ended_at) && dateField) {
          if (started_at && ended_at) {
            localWhere.push(
              `maintenance_tasks.${dateField} BETWEEN :started_at AND :ended_at`
            );
            localReplacements.started_at = `${started_at} 00:00:00`;
            localReplacements.ended_at = `${ended_at} 23:59:59`;
          } else if (started_at) {
            localWhere.push(
              `maintenance_tasks.${dateField} BETWEEN :started_at AND :ended_at`
            );
            localReplacements.started_at = `${started_at} 00:00:00`;
            localReplacements.ended_at = `${started_at} 23:59:59`;
          } else if (ended_at) {
            localWhere.push(
              `maintenance_tasks.${dateField} BETWEEN :started_at AND :ended_at`
            );
            localReplacements.started_at = `${ended_at} 00:00:00`;
            localReplacements.ended_at = `${ended_at} 23:59:59`;
          }
        }

        let query = baseQuery;
        if (localWhere.length > 0) {
          query += " WHERE " + localWhere.join(" AND ");
        }
        query += " ORDER BY maintenance_tasks.created_at DESC";

        const result = await sequelize.query(query, {
          replacements: localReplacements,
          type: sequelize.QueryTypes.SELECT,
        });

        allResults = allResults.concat(
          result.map((item) => ({
            ...item,
            image_before:
              item.image_before != null ? JSON.parse(item.image_before) : [],
            image_after:
              item.image_after != null ? JSON.parse(item.image_after) : [],
          }))
        );
      }
      return res.status(200).json(allResults);
    }

    if (statusIds.length == 1) {
      whereClauses.push("maintenance_tasks.status_id = :status_id");
      replacements.status_id = statusIds[0];
    }

    let dateField = null;
    if (statusIds.length === 1) {
      if (
        [maintenance_status.PENDING, maintenance_status.ASSIGNED].includes(
          statusIds[0]
        )
      )
        dateField = "created_at";
      else if (statusIds[0] == maintenance_status.IN_PROGRESS)
        dateField = "started_at";
      else if (
        [maintenance_status.COMPLETED, maintenance_status.UNRESOLVED].includes(
          statusIds[0]
        )
      )
        dateField = "ended_at";
    }

    if ((started_at || ended_at) && dateField) {
      if (started_at && ended_at) {
        whereClauses.push(
          `maintenance_tasks.${dateField} BETWEEN :started_at AND :ended_at`
        );
        replacements.started_at = `${started_at} 00:00:00`;
        replacements.ended_at = `${ended_at} 23:59:59`;
      } else if (started_at) {
        whereClauses.push(
          `maintenance_tasks.${dateField} BETWEEN :started_at AND :ended_at`
        );
        replacements.started_at = `${started_at} 00:00:00`;
        replacements.ended_at = `${started_at} 23:59:59`;
      } else if (ended_at) {
        whereClauses.push(
          `maintenance_tasks.${dateField} BETWEEN :started_at AND :ended_at`
        );
        replacements.started_at = `${ended_at} 00:00:00`;
        replacements.ended_at = `${ended_at} 23:59:59`;
      }
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
      image_before:
        item.image_before != null ? JSON.parse(item.image_before) : [],
      image_after: item.image_after != null ? JSON.parse(item.image_after) : [],
    }));

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
      rooms.guest_status_id,
      rooms.dnd_status,
      rooms.room_check_status,
      rooms.cleaning_status_id,
      rooms.is_online,
      rooms.ip_address,
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

    try {
      result.image_before =
        result.image_before != null ? JSON.parse(result.image_before) : [];
    } catch (e) {
      result.image_before = [];
    }
    try {
      result.image_after =
        result.image_after != null ? JSON.parse(result.image_after) : [];
    } catch (e) {
      result.image_after = [];
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetMaintenanceTaskByUserID = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status_id } = req.query;

    let whereClause = "maintenance_tasks.assigned_to = :user_id";
    const replacements = { user_id };

    if (status_id) {
      const statusArr = Array.isArray(status_id)
        ? status_id
        : status_id.split(",").map((id) => Number(id.trim()));
      if (statusArr.length > 1) {
        whereClause += " AND maintenance_tasks.status_id IN (:status_ids)";
        replacements.status_ids = statusArr;
      } else {
        whereClause += " AND maintenance_tasks.status_id = :status_id";
        replacements.status_id = statusArr[0];
      }
    }

    const result = await sequelize.query(
      `SELECT
        maintenance_tasks.*,
        rooms.room_number,
        rooms.floor,
        rooms.guest_status_id,
        rooms.dnd_status,
        rooms.room_check_status,
        rooms.cleaning_status_id,
        rooms.is_online,
        rooms.ip_address,
        assigned_user.full_name AS assigned_to_name,
        created_by_user.full_name AS created_by_name
      FROM maintenance_tasks
      JOIN rooms ON rooms.id = maintenance_tasks.room_id
      LEFT JOIN users AS assigned_user ON assigned_user.id = maintenance_tasks.assigned_to
      LEFT JOIN users AS created_by_user ON created_by_user.id = maintenance_tasks.created_by
      WHERE ${whereClause}
      ORDER BY maintenance_tasks.status_id, maintenance_tasks.created_at DESC`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const parsedResults = result.map((item) => ({
      ...item,
      image_before:
        item.image_before != null ? JSON.parse(item.image_before) : [],
      image_after: item.image_after != null ? JSON.parse(item.image_after) : [],
    }));

    const statusCounts = await countTaskByUserId(user_id);

    res.status(200).json({
      statusCounts,
      tasks: parsedResults,
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
      room_id,
      fix_description = null,
      problem_description = null,
      started_at = null,
      ended_at = null,
      status_id = null,
      assigned_to = null,
    } = req.body;
    const { id, role_id } = req.user;

    let taskResult;
    if (role_id == member_role.TECHNICIAN) {
      [taskResult] = await sequelize.query(
        `SELECT * FROM maintenance_tasks WHERE id = :task_id AND assigned_to = :assigned_to`,
        {
          replacements: { task_id, assigned_to: id },
          type: sequelize.QueryTypes.SELECT,
        }
      );
    } else {
      [taskResult] = await sequelize.query(
        `SELECT * FROM maintenance_tasks WHERE id = :task_id`,
        {
          replacements: { task_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );
    }
    if (!taskResult) {
      return res.status(404).json({ message: "Maintenance task not found." });
    }

    const isRoom = await sequelize.query(
      `SELECT * FROM maintenance_tasks WHERE room_id = :room_id AND status_id IN (${maintenance_status.PENDING}, ${maintenance_status.ASSIGNED}, ${maintenance_status.IN_PROGRESS}) AND id != :task_id`,
      {
        replacements: { room_id, task_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (isRoom.length > 0) {
      return res.status(403).json({
        message:
          "#" + room_id + " This room has an unfinished maintenance task.",
      });
    }

    const image_before = req.files?.before
      ? req.files.before.map((file) => file.filename)
      : null;

    const image_after = req.files?.after
      ? req.files.after.map((file) => file.filename)
      : null;

    const updates = [];
    const replacements = { task_id };

    if (room_id) {
      updates.push("room_id = :room_id");
      replacements.room_id = room_id;
    }

    if (status_id) {
      updates.push("status_id = :status_id");
      replacements.status_id = status_id;
    }

    if (assigned_to) {
      updates.push("assigned_to = :assigned_to");
      replacements.assigned_to = assigned_to;
      updates.push("created_by = :created_by");
      replacements.created_by = id;
    }

    if (fix_description) {
      updates.push("fix_description = :fix_description");
      replacements.fix_description = fix_description;
    }

    if (problem_description) {
      updates.push("problem_description = :problem_description");
      replacements.problem_description = problem_description;
    }

    if (started_at) {
      updates.push("started_at = :started_at");
      replacements.started_at = dayjs(started_at)
        .utc()
        .format("YYYY-MM-DD HH:mm:ss");
    } else {
      if (status_id == maintenance_status.IN_PROGRESS) {
        const local = dayjs().format();
        dayjs.extend(utc);
        updates.push("started_at = :started_at");
        replacements.started_at = dayjs(local)
          .utc()
          .format("YYYY-MM-DD HH:mm:ss");
      }
    }

    if (ended_at) {
      updates.push("ended_at = :ended_at");
      replacements.ended_at = dayjs(ended_at)
        .utc()
        .format("YYYY-MM-DD HH:mm:ss");
    } else {
      if (
        status_id == maintenance_status.COMPLETED ||
        status_id == maintenance_status.UNRESOLVED
      ) {
        const local = dayjs().format();
        dayjs.extend(utc);
        updates.push("ended_at = :ended_at");
        replacements.ended_at = dayjs(local)
          .utc()
          .format("YYYY-MM-DD HH:mm:ss");
      }
    }

    if (image_before) {
      updates.push("image_before = :image_before");
      replacements.image_before = JSON.stringify(image_before);
    }

    if (image_after) {
      updates.push("image_after = :image_after");
      replacements.image_after = JSON.stringify(image_after);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    const updateQuery = `
      UPDATE maintenance_tasks
      SET ${updates.join(", ")}
      WHERE id = :task_id
    `;

    await sequelize.query(updateQuery, {
      replacements,
      type: sequelize.QueryTypes.UPDATE,
    });

    // send ws to client
    try {
      const oldData = taskResult;
      const task = await getTaskWithDetailsById(oldData.id);
      const statusCounts = await countTaskByUserId(id);

      task.image_before =
        task.image_before != null ? JSON.parse(task.image_before) : [];

      task.image_after =
        task.image_after != null ? JSON.parse(task.image_after) : [];

      if (role_id == member_role.TECHNICIAN_LEAD) {
        // console.log(member_role.TECHNICIAN_LEAD, assigned_to);
        const resWS = sendWsMessageToUser(assigned_to, {
          cmd: ws_cmd.UPDATE_TASK,
          param: {
            statusCounts: statusCounts,
            task: task,
          },
        });
        console.log(`sendWsMessageToUser: ${resWS}`);
      } else {
        const resWS = sendWsMessageToUser(id, {
          cmd: ws_cmd.UPDATE_TASK,
          param: {
            statusCounts: statusCounts,
            task: task,
          },
        });
        console.log(`sendWsMessageToUser: ${resWS}`);
        if (
          status_id == maintenance_status.IN_PROGRESS ||
          status_id == maintenance_status.COMPLETED ||
          status_id == maintenance_status.UNRESOLVED
        ) {
          const resWS = sendWsMessageToModbusClient({
            cmd: ws_cmd.WRITE_REGISTER,
            param: {
              ip: task.ip_address,
              address: 20,
              value: status_id == maintenance_status.IN_PROGRESS ? 1 : 0,
              slaveId: 1,
              fc: 6,
              userId: id,
            },
          });
          console.log(`sendWsMessageToModbusClient: ${resWS}`);
        }
      }

      const resWS = sendWsMessageToRole(member_role.TECHNICIAN_LEAD, {
        cmd: ws_cmd.UPDATE_TASK,
        param: {
          statusCounts: statusCounts,
          task: task,
        },
      });
      console.log(`sendWsMessageToRole : ${resWS}`);
    } catch (err) {
      console.error("WebSocket Error:", err);
    }

    return res
      .status(200)
      .json({ message: "Maintenance task updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.DeleteMaintenanceTask = async (req, res) => {
  try {
    const { task_id } = req.params;

    const [task] = await sequelize.query(
      `SELECT assigned_to FROM maintenance_tasks WHERE id = :task_id`,
      {
        replacements: { task_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const assigned_to = task.assigned_to;

    await sequelize.query(`DELETE FROM maintenance_tasks WHERE id = :task_id`, {
      replacements: { task_id },
      type: sequelize.QueryTypes.DELETE,
    });

    const statusCounts = await countTaskByUserId(assigned_to);

    sendWsMessageToUser(assigned_to, {
      cmd: ws_cmd.DELETE_TASK,
      param: {
        statusCounts,
        task_id,
      },
    });

    sendWsMessageToRole(member_role.TECHNICIAN_LEAD, {
      cmd: ws_cmd.DELETE_TASK,
      param: {
        statusCounts,
        task_id,
      },
    });

    return res
      .status(200)
      .json({ message: "Maintenance task deleted successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetRoomNumberAndFloor = async (req, res) => {
  try {
    const rooms = await sequelize.query(
      `SELECT id, room_number, floor FROM rooms ORDER BY floor, room_number ASC`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found." });
    }
    res.status(200).json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
