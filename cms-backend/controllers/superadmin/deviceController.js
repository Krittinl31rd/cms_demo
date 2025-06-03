const sequelize = require("../../config/db");
const {
  cleaning_status,
  guest_presence_status,
  device_type,
} = require("../../constants/common");

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

exports.UpdateDevice = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { room_id, device_id } = req.params;
    const { name, type_id, address } = req.body;

    const checkRoomExists = async (id) => {
      const rooms = await sequelize.query(
        `SELECT id FROM rooms WHERE id = :room_id`,
        { replacements: { room_id: id }, type: sequelize.QueryTypes.SELECT }
      );
      return rooms.length > 0;
    };

    const checkTypeExists = async (id) => {
      const types = await sequelize.query(
        `SELECT id FROM device_types WHERE id = :type_id`,
        { replacements: { type_id: id }, type: sequelize.QueryTypes.SELECT }
      );
      return types.length > 0;
    };

    const checkDuplicateDeviceName = async (room_id, device_id, name) => {
      const devices = await sequelize.query(
        `SELECT id FROM devices WHERE room_id = :room_id AND name = :name AND id != :device_id`,
        {
          replacements: { room_id, name, device_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      return devices.length > 0;
    };

    const checkAddress = async (room_id, device_id, addrValues) => {
      if (addrValues.length === 0) return false;

      const controls = await sequelize.query(
        `SELECT value FROM device_control WHERE room_id = :room_id AND value IN (:values) AND device_id != :device_id`,
        {
          replacements: { room_id, values: addrValues, device_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return controls.length > 0 ? controls.map((c) => c.value) : false;
    };

    if (!(await checkRoomExists(room_id))) {
      return res.status(404).json({ message: "Room not found." });
    }

    if (!(await checkTypeExists(type_id))) {
      return res.status(404).json({ message: "Device type not found." });
    }

    if (await checkDuplicateDeviceName(room_id, device_id, name)) {
      return res
        .status(403)
        .json({ message: "Device name already exists in this room." });
    }

    const addrValues = (address || [])
      .map((a) => a.addr)
      .filter((v) => v != null);

    const controlsAddresses = await checkAddress(
      room_id,
      device_id,
      addrValues
    );
    if (controlsAddresses) {
      return res.status(403).json({
        message: `Address value(s) already used in this room: ${controlsAddresses.join(
          ", "
        )}`,
      });
    }

    await sequelize.query(
      `UPDATE devices SET name = :name, type_id = :type_id WHERE id = :device_id AND room_id = :room_id`,
      {
        replacements: { name, type_id, device_id, room_id },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      }
    );

    const updateExistingControl = async (
      device_id,
      control_id,
      name,
      value
    ) => {
      const existingControl = await sequelize.query(
        `SELECT control_id FROM device_control WHERE device_id = :device_id AND control_id = :control_id`,
        {
          replacements: { device_id, control_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (existingControl.length > 0) {
        await sequelize.query(
          `UPDATE device_control SET name = :name, value = :value WHERE device_id = :device_id AND control_id = :control_id`,
          {
            replacements: { device_id, control_id, name, value },
            transaction: t,
          }
        );
      }
    };

    if (Array.isArray(address)) {
      for (const ctrl of address) {
        await updateExistingControl(device_id, ctrl.id, ctrl.name, ctrl.addr);
      }
    }

    await t.commit();
    return res.status(200).json({ message: "Device updated successfully." });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
