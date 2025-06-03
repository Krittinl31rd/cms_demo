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

module.exports = { checkExists };
