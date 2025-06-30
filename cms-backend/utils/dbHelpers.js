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
    assigned_user.full_name AS assigned_to_name,
    created_by_user.full_name AS created_by_name
  FROM maintenance_tasks
  JOIN  rooms ON rooms.id = maintenance_tasks.room_id
  LEFT JOIN users AS assigned_user ON assigned_user.id = maintenance_tasks.assigned_to
  LEFT JOIN users AS created_by_user ON created_by_user.id = maintenance_tasks.created_by
`;

module.exports = { checkExists, getMaintenanceTaskBaseQuery };
