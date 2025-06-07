const sequelize = require("../../config/db");
const upload = require("../../middleware/uploadImage");
const {
  checkExists,
  getMaintenanceTaskBaseQuery,
} = require("../../utils/dbHelpers");
const { maintenance_status, member_role } = require("../../constants/common");

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
    const query = getMaintenanceTaskBaseQuery();
    const result = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    const parsedResults = result.map((item) => ({
      ...item,
      image_report: item.image_report ? JSON.parse(item.image_report) : null,
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
    const query = getMaintenanceTaskBaseQuery();
    const [result] = await sequelize.query(
      `${query} WHERE maintenance_tasks.id = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetMaintenanceTaskByUserID = async (req, res) => {
  try {
    const { user_id } = req.params;
    const query = getMaintenanceTaskBaseQuery();
    const result = await sequelize.query(
      `${query} WHERE maintenance_tasks.assigned_to = :user_id`,
      {
        replacements: { user_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    res.status(200).json(result);
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
