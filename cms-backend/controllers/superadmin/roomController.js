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
// CREATE DEVICE
exports.CreateDevice = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { room_id, type_id, name, address } = req.body;
    const isRoom = await sequelize.query(
      `SELECT * FROM rooms WHERE id = :room_id`,
      {
        replacements: { room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (isRoom.length <= 0) {
      return res.status(403).json({ message: "This room is not found." });
    }

    const isType = await sequelize.query(
      `SELECT * FROM device_types WHERE id = :type_id`,
      {
        replacements: { type_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (isType.length <= 0) {
      return res.status(403).json({ message: "This type is not found." });
    }

    const isDevice = await sequelize.query(
      `SELECT * FROM devices WHERE name = :name`,
      {
        replacements: { name },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if (isDevice.length > 0) {
      return res.status(403).json({ message: "Device name is already exits." });
    }

    const usedAddressValues = address
      .map((a) => a.addr)
      .filter((v) => v != null);

    if (usedAddressValues.length > 0) {
      const existingAddresses = await sequelize.query(
        `SELECT value FROM device_control 
          WHERE room_id = :room_id AND value IN (:values)`,
        {
          replacements: {
            room_id,
            values: usedAddressValues,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (existingAddresses.length > 0) {
        return res.status(403).json({
          message: `Address value(s) already used in this room: ${existingAddresses
            .map((e) => e.value)
            .join(", ")}`,
        });
      }
    }

    const [result, metadata] = await sequelize.query(
      `INSERT INTO devices (room_id, type_id, name)
       VALUES (:room_id, :type_id, :name)`,
      {
        replacements: { room_id, type_id, name },
        type: sequelize.QueryTypes.INSERT,
        transaction: t,
      }
    );
    const deviceId = result;

    const insertControl = async (control_id, controlName, value = null) => {
      try {
        await sequelize.query(
          `INSERT INTO device_control (room_id, device_id, control_id, name, value)
           VALUES (:room_id, :device_id, :control_id, :name, :value)`,
          {
            replacements: {
              room_id,
              device_id: deviceId,
              control_id,
              name: controlName,
              value,
            },
            transaction: t,
          }
        );

        return { success: true };
      } catch (err) {
        if (err.original?.code === "ER_DUP_ENTRY") {
          return {
            success: false,
            message: `Control already exists: control_id=${control_id}`,
          };
        }
        throw err;
      }
    };

    switch (type_id) {
      case device_type.AIR:
        await insertControl(1, "status");
        await insertControl(2, "fanspeed");
        await insertControl(3, "temp");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.CURTAIN:
        break;
      case device_type.DIMMER:
        await insertControl(1, "status");
        await insertControl(2, "brightness");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.LIGHTING:
        await insertControl(1, "status");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.RGB:
        break;
      case device_type.THERMOSTAT:
        break;
      case device_type.MOTION:
        break;
      case device_type.SCENE:
        await insertControl(1, "master");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.URLBUTTON:
        break;
      case device_type.ACCESS:
        await insertControl(1, "keycard");
        await insertControl(2, "maid");
        await insertControl(3, "guest");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.DNDMUR:
        await insertControl(1, "dndmur");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.POWER:
        await insertControl(1, "voltage");
        await insertControl(2, "current");
        await insertControl(3, "power");
        await insertControl(4, "pf");
        await insertControl(5, "energy");
        await insertControl(6, "freq");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.AIR_QAULITY:
        await insertControl(1, "pm25");
        await insertControl(2, "co2");
        await insertControl(3, "tvoc");
        await insertControl(4, "hcho");
        await insertControl(5, "temp");
        await insertControl(6, "hum");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.TEMPERATURE:
        await insertControl(1, "temp");
        for (const i of address) {
          const result = await insertControl(i.id, i.name, i.addr);
          if (result?.success == false) {
            return res.status(403).json({ message: result.message });
          }
        }
        break;
      case device_type.LOSSNAY:
        break;
    }

    await t.commit();
    return res.status(201).json({ message: "Device created successfully." });
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// READ ROOM
exports.GetRooms = async (req, res) => {
  try {
    const rooms = await sequelize.query(`SELECT * FROM rooms;`, {
      type: sequelize.QueryTypes.SELECT,
    });

    const roomList = await Promise.all(
      rooms.map(async (room) => {
        const devices = await sequelize.query(
          `SELECT d.id, d.type_id, d.name, d.status_id, d.last_online, d.config
                    FROM devices d
                    WHERE d.room_id = :room_id`,
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
          guest_check_id: room.guest_check_id,
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
      `SELECT * FROM rooms WHERE id = :room_id;`,
      {
        replacements: { room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (rooms.length <= 0) {
      res.status(200).json({ message: "Not found this room." });
    }

    const [roomList] = await Promise.all(
      rooms.map(async (room) => {
        const devices = await sequelize.query(
          `SELECT d.id, d.type_id, d.name, d.status_id, d.last_online, d.config
                    FROM devices d
                    WHERE d.room_id = :room_id`,
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
          guest_check_id: room.guest_check_id,
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

// UPDATE ROOM
exports.UpdateRoom = async (req, res) => {
  const {} = req.body;
  try {
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// DELETE ROOM
exports.DeleteRoom = async (req, res) => {
  const {} = req.body;
  try {
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
