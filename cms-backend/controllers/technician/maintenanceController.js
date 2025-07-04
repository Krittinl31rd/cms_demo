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
      VALUES (:room_id, :assigned_to, :problem_description, ${maintenance_status.ASSIGNED}, :created_by)
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

exports.GetRooms = async (req, res) => {
  try {
    const rooms = await sequelize.query(
      `SELECT id, room_number, floor, guest_status_id, cleaning_status_id, dnd_status, mur_status, room_check_status, is_online FROM rooms`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetRoomByIDWithDevices = async (req, res) => {
  try {
    const { room_id } = req.params;
    const rooms = await sequelize.query(
      `SELECT id 
      FROM rooms WHERE id = :room_id;`,
      {
        replacements: { room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (rooms.length <= 0) {
      return res.status(400).json({ message: "Not found this room." });
    }

    const [roomList] = await Promise.all(
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
          room_id: room.id,
          room_number: room.room_number,
          floor: room.floor,
          guest_status_id: room.guest_status_id,
          cleaning_status_id: room.cleaning_status_id,
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

    res.status(200).json(roomList);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
