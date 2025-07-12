const sequelize = require("../config/db");
const {
  maintenance_status,
  statusNameMap,
  member_role,
} = require("../constants/common");

const checkExists = async (sequelize, table, id) => {
  const result = await sequelize.query(
    `SELECT id FROM ${table} WHERE id = :id`,
    {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  return result.length > 0;
};

const getMaintenanceTaskBaseQuery = () => `
  SELECT
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
    technician.type_id AS assigned_to_type,
    created_by_user.full_name AS created_by_name
  FROM maintenance_tasks
  JOIN  rooms ON rooms.id = maintenance_tasks.room_id
  JOIN  technician ON technician.user_id = maintenance_tasks.assigned_to
  LEFT JOIN users AS assigned_user ON assigned_user.id = maintenance_tasks.assigned_to
  LEFT JOIN users AS created_by_user ON created_by_user.id = maintenance_tasks.created_by
`;

const getTaskWithDetailsById = async (task_id) => {
  const baseQuery = getMaintenanceTaskBaseQuery();
  const [task] = await sequelize.query(
    `${baseQuery} WHERE maintenance_tasks.id = :task_id`,
    {
      replacements: { task_id },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  return task;
};

const countTaskByUserId = async (user_id) => {
  const result = await sequelize.query(
    `SELECT status_id, COUNT(*) AS count
     FROM maintenance_tasks
     WHERE assigned_to = :user_id
     GROUP BY status_id`,
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
    unresolved: 0,
  };

  result.forEach(({ status_id, count }) => {
    const name = statusNameMap[status_id];
    if (name) statusCounts[name] = count;
  });

  return statusCounts;
};

module.exports = {
  checkExists,
  getMaintenanceTaskBaseQuery,
  countTaskByUserId,
  getTaskWithDetailsById,
};
