const sequelize = require("../../config/db");
const {
  cleaning_status,
  guest_presence_status,
  device_type,
} = require("../../constants/common");

// CREATE ROOM
exports.CreateRoom = async (req, res) => {
  try {
    const { room_number, floor, address = [] } = req.body;
    const [isRoom] = await sequelize.query(
      `SELECT * FROM rooms WHERE room_number = :room_number AND floor = :floor`,
      {
        replacements: { room_number, floor },
      }
    );

    if (isRoom.length > 0) {
      return res.status(403).json({ message: "This room is already exists." });
    }

    await sequelize.query(
      `INSERT INTO rooms (room_number, floor, guest_status_id, cleaning_status_id) 
      VALUES (:room_number, :floor, :guest_status_id, :cleaning_status_id)`,
      {
        replacements: {
          room_number,
          floor,
          guest_status_id: guest_presence_status.GUEST_OUT,
          cleaning_status_id: cleaning_status.DIRTY_VACANT,
        },
      }
    );
    res.status(200).json({ message: "Create room successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// READ ROOM
exports.GetRooms = async (req, res) => {
  try {
    const rooms = await sequelize.query(
      `SELECT * FROM smarthotel.rooms ORDER BY floor OR room_number ASC`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const roomList = await Promise.all(
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
          request_status: room.request_status,
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

exports.GetRoomByID = async (req, res) => {
  try {
    const { room_id } = req.params;
    const rooms = await sequelize.query(
      `SELECT id, room_number, floor, guest_status_id, cleaning_status_id, request_status, mur_status, room_check_status, is_online 
      FROM rooms WHERE id = :room_id;`,
      {
        replacements: { room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (rooms.length <= 0) {
      return res.status(400).json({ message: "Not found this room." });
    }

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
          request_status: room.request_status,
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

exports.GetRoomWithConfig = async (req, res) => {
  try {
    const rooms = await sequelize.query(
      `  
    SELECT r.id, r.room_number, r.floor, r.is_online, r.ip_address, r.mac_address, c.config
    FROM rooms r
    LEFT JOIN rcu_config c ON r.id = c.room_id
`,
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

// UPDATE ROOM
exports.UpdateRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { room_number, floor } = req.body;

    const isRoom = await sequelize.query(
      `SELECT * FROM rooms WHERE (room_number = :room_number AND floor = :floor) AND id != :room_id`,
      {
        replacements: { room_number, floor, room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (isRoom.length > 0) {
      return res
        .status(400)
        .json({ message: "This room number and floor already exist." });
    }

    await sequelize.query(
      `
      UPDATE rooms 
      SET room_number = :room_number, floor = :floor
      WHERE id = :room_id
      `,
      {
        replacements: { room_id, room_number, floor },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({ message: "Update successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE ROOM
exports.DeleteRoom = async (req, res) => {
  try {
    const { room_id } = req.params;

    const devices = await sequelize.query(
      `SELECT * FROM devices WHERE room_id = :room_id`,
      {
        replacements: { room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (devices.length > 0) {
      return res.status(400).json({
        message: "Cannot delete room because it still has devices assigned.",
      });
    }

    await sequelize.query(`DELETE FROM rooms WHERE id = :room_id`, {
      replacements: { room_id },
      type: sequelize.QueryTypes.DELETE,
    });

    res.status(200).json({ message: "Room deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
