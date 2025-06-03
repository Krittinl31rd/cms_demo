require("dotenv").config();
const sequelize = require("./config/db");

const {
  member_role,
  guest_check_status,
  guest_presence_status,
  notification_type,
  logs_type,
  device_status,
  device_type,
  maintenance_status,
  task_status,
  cleaning_status,
} = require("./constants/common");

async function initTables() {
  try {
    for (const [key, value] of Object.entries(device_status)) {
      await sequelize.query(
        `INSERT INTO device_statuses (name)
         VALUES (:name)`,
        {
          replacements: { name: key },
        }
      );
    }

    for (const [key, value] of Object.entries(cleaning_status)) {
      await sequelize.query(
        `INSERT INTO cleaning_statuses (name)
         VALUES (:name)`,
        {
          replacements: { name: key },
        }
      );
    }

    for (const [key, value] of Object.entries(device_type)) {
      await sequelize.query(
        `INSERT INTO device_types (name)
         VALUES (:name)`,
        {
          replacements: { name: key },
        }
      );
    }

    for (const [key, value] of Object.entries(guest_check_status)) {
      await sequelize.query(
        `INSERT INTO guest_check_status (id, name)
         VALUES (:id, :name)`,
        {
          replacements: { id: value, name: key },
        }
      );
    }

    for (const [key, value] of Object.entries(guest_presence_status)) {
      await sequelize.query(
        `INSERT INTO guest_statuses (id, name)
         VALUES (:id, :name)`,
        {
          replacements: { id: value, name: key },
        }
      );
    }

    for (const [key, value] of Object.entries(logs_type)) {
      await sequelize.query(
        `INSERT INTO logs_types (name)
         VALUES (:name)`,
        {
          replacements: { name: key },
        }
      );
    }

    for (const [key, value] of Object.entries(maintenance_status)) {
      await sequelize.query(
        `INSERT INTO maintenance_statuses (name)
         VALUES (:name)`,
        {
          replacements: { name: key },
        }
      );
    }

    for (const [key, value] of Object.entries(notification_type)) {
      await sequelize.query(
        `INSERT INTO notification_types (name)
         VALUES (:name)`,
        {
          replacements: { name: key },
        }
      );
    }

    for (const [key, value] of Object.entries(task_status)) {
      await sequelize.query(
        `INSERT INTO task_statuses (name)
         VALUES (:name)`,
        {
          replacements: { name: key },
        }
      );
    }

    console.log("inserted successfully.");
  } catch (err) {
    console.error("inserting:", err);
  }
}

initTables();
