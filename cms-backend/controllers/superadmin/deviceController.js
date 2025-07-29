const sequelize = require("../../config/db");

const {
  cleaning_status,
  guest_presence_status,
  device_type,
} = require("../../constants/common");

// CREATE DEVICE
// CREATE DEVICE
exports.CreateDevice = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { room_id, type_id, name, address } = req.body;

    const [isRoom] = await sequelize.query(
      `SELECT * FROM rooms WHERE id = :room_id`,
      { replacements: { room_id }, type: sequelize.QueryTypes.SELECT }
    );
    if (!isRoom)
      return res.status(403).json({ message: "This room is not found." });

    const [isType] = await sequelize.query(
      `SELECT * FROM device_types WHERE id = :type_id`,
      { replacements: { type_id }, type: sequelize.QueryTypes.SELECT }
    );
    if (!isType)
      return res.status(403).json({ message: "This type is not found." });

    // const [isDevice] = await sequelize.query(
    //   `SELECT * FROM devices WHERE name = :name`,
    //   { replacements: { name }, type: sequelize.QueryTypes.SELECT }
    // );
    // if (isDevice)
    //   return res
    //     .status(403)
    //     .json({ message: "Device name is already exists." });

    const usedAddressValues = address
      .map((a) => a.addr)
      .filter((v) => v != null);
    if (usedAddressValues.length > 0) {
      const existingAddresses = await sequelize.query(
        `SELECT value FROM device_control 
         WHERE room_id = :room_id AND value IN (:values)`,
        {
          replacements: { room_id, values: usedAddressValues },
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

    const [deviceId] = await sequelize.query(
      `INSERT INTO devices (room_id, type_id, name)
       VALUES (:room_id, :type_id, :name)`,
      {
        replacements: { room_id, type_id, name },
        type: sequelize.QueryTypes.INSERT,
        transaction: t,
      }
    );

    const controlList = [];

    const staticControlsMap = {
      [device_type.AIR]: [
        { control_id: 1, name: "status" },
        { control_id: 2, name: "fanspeed" },
        { control_id: 3, name: "temp" },
      ],
      [device_type.DIMMER]: [
        { control_id: 1, name: "status" },
        { control_id: 2, name: "brightness" },
      ],
      [device_type.LIGHTING]: [{ control_id: 1, name: "status" }],
      [device_type.SCENE]: [{ control_id: 1, name: "sence" }],
      [device_type.ACCESS]: [{ control_id: 1, name: "access" }],
      [device_type.DNDMUR]: [{ control_id: 1, name: "dndmur" }],
      [device_type.POWER]: [
        { control_id: 1, name: "voltage" },
        { control_id: 2, name: "current" },
        { control_id: 3, name: "power" },
        { control_id: 4, name: "pf" },
        { control_id: 5, name: "energy" },
        { control_id: 6, name: "freq" },
      ],
      [device_type.AIR_QAULITY]: [
        { control_id: 1, name: "pm25" },
        { control_id: 2, name: "co2" },
        { control_id: 3, name: "tvoc" },
        { control_id: 4, name: "hcho" },
        { control_id: 5, name: "temp" },
        { control_id: 6, name: "hum" },
      ],
      [device_type.MOTION]: [{ control_id: 1, name: "motion" }],
      [device_type.TEMPERATURE]: [{ control_id: 1, name: "sensor" }],
      [device_type.OTHER]: [{ control_id: 1, name: "other" }],
      [device_type.CONFIG]: [
        { control_id: 1, name: "sleep_start_hour" },
        { control_id: 2, name: "sleep_start_min" },
        { control_id: 3, name: "energysaving_time" },
        { control_id: 4, name: "sleep_max_temp" },
        { control_id: 5, name: "sleep_reverse_hour" },
        { control_id: 6, name: "sleep_reverse_min" },
        { control_id: 7, name: "fan_set_checkin" },
        { control_id: 8, name: "temp_set_checkin" },
        { control_id: 9, name: "fan_set_checkout" },
        { control_id: 10, name: "temp_set_checkout" },
        { control_id: 11, name: "fan_set_esm03" },
        { control_id: 12, name: "temp_set_esm03" },
        { control_id: 13, name: "timedelay_esm03" },
        { control_id: 14, name: "timeset_keycard" },
        { control_id: 15, name: "fanset_on_keycard" },
        { control_id: 16, name: "tempset_on_keycard" },
        { control_id: 17, name: "fan_set_off_keycard" },
        { control_id: 18, name: "temp_set_off_keycard" },
        { control_id: 19, name: "recheck_config_op" },
        { control_id: 20, name: "hour" },
        { control_id: 21, name: "min" },
        { control_id: 22, name: "sec" },
        { control_id: 23, name: "date" },
        { control_id: 24, name: "month" },
        { control_id: 25, name: "year" },
        { control_id: 26, name: "fan_set_esm04" },
        { control_id: 27, name: "temp_set_esm04" },
        { control_id: 28, name: "time_delay_esm04" },
        { control_id: 29, name: "fan_set_esm05" },
        { control_id: 30, name: "temp_set_esm05" },
        { control_id: 31, name: "time_delay_esm05" },
      ],
      [device_type.CONFIG_SENCE]: (() => {
        const template = [];
        const baseConfig = [
          "hour_start",
          "min_start",
          "hour_stop",
          "min_stop",
          "enabled",
          "color_temp",
        ];

        let currentId = 1;

        for (let sceneIndex = 0; sceneIndex < 5; sceneIndex++) {
          baseConfig.forEach((key) => {
            template.push({
              control_id: currentId,
              name: `${key}_${sceneIndex + 1}`,
            });
            currentId++;
          });
        }

        return template;
      })(),
    };

    // missing check type_id
    const staticControls = staticControlsMap[type_id] || [];

    for (const ctrl of staticControls) {
      controlList.push({
        room_id,
        device_id: deviceId,
        control_id: ctrl.control_id,
        name: ctrl.name,
        value: null,
      });
    }

    for (const i of address) {
      controlList.push({
        room_id,
        device_id: deviceId,
        control_id: i.id,
        name: i.name,
        value: i.addr,
      });
    }
    if (controlList.length > 0) {
      const values = controlList
        .map(
          (c) =>
            `(${room_id}, ${deviceId}, ${c.control_id}, ${sequelize.escape(
              c.name
            )}, ${c.value === null ? "NULL" : c.value})`
        )
        .join(", ");

      await sequelize.query(
        `INSERT INTO device_control (room_id, device_id, control_id, name, value) VALUES ${values}`,
        { transaction: t }
      );
    }

    await t.commit();
    return res.status(201).json({ message: "Device created successfully." });
  } catch (err) {
    await t.rollback();
    console.error("CREATE DEVICE ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateDevice = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { room_id, device_id } = req.params;
    const { name, type_id, address } = req.body;

    const [[room], [type]] = await Promise.all([
      sequelize.query(`SELECT id FROM rooms WHERE id = :room_id`, {
        replacements: { room_id },
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(`SELECT id FROM device_types WHERE id = :type_id`, {
        replacements: { type_id },
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    if (!room) return res.status(404).json({ message: "Room not found." });
    if (!type)
      return res.status(404).json({ message: "Device type not found." });

    // const [duplicateDevice] = await sequelize.query(
    //   `SELECT id FROM devices WHERE room_id = :room_id AND name = :name AND id != :device_id`,
    //   {
    //     replacements: { room_id, name, device_id },
    //     type: sequelize.QueryTypes.SELECT,
    //   }
    // );
    // if (duplicateDevice) {
    //   return res
    //     .status(403)
    //     .json({ message: "Device name already exists in this room." });
    // }

    const addrValues = (address || [])
      .map((a) => a.addr)
      .filter((v) => v != null);
    if (addrValues.length > 0) {
      const existingAddr = await sequelize.query(
        `SELECT value FROM device_control 
         WHERE room_id = :room_id AND value IN (:values) AND device_id != :device_id`,
        {
          replacements: { room_id, values: addrValues, device_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      if (existingAddr.length > 0) {
        return res.status(403).json({
          message: `Address value(s) already used in this room: ${existingAddr
            .map((e) => e.value)
            .join(", ")}`,
        });
      }
    }

    await sequelize.query(
      `UPDATE devices SET name = :name, type_id = :type_id WHERE id = :device_id AND room_id = :room_id`,
      {
        replacements: { name, type_id, device_id, room_id },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      }
    );

    if (Array.isArray(address)) {
      for (const ctrl of address) {
        await sequelize.query(
          `UPDATE device_control SET name = :name, value = :value 
           WHERE device_id = :device_id AND control_id = :control_id`,
          {
            replacements: {
              name: ctrl.name,
              value: ctrl.addr,
              device_id,
              control_id: ctrl.id,
            },
            type: sequelize.QueryTypes.UPDATE,
            transaction: t,
          }
        );
      }
    }

    await t.commit();
    return res.status(200).json({ message: "Device updated successfully." });
  } catch (err) {
    await t.rollback();
    console.error("UPDATE DEVICE ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.DeleteDevice = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { room_id, device_id } = req.params;

    const device = await sequelize.query(
      `SELECT * FROM devices WHERE id = :device_id AND room_id = :room_id`,
      {
        replacements: { device_id, room_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (device.length === 0) {
      return res
        .status(404)
        .json({ message: "Device not found in this room." });
    }

    await sequelize.query(
      `DELETE FROM device_control WHERE device_id = :device_id`,
      {
        replacements: { device_id },
        transaction: t,
      }
    );

    await sequelize.query(
      `DELETE FROM devices WHERE id = :device_id AND room_id = :room_id`,
      {
        replacements: { device_id, room_id },
        transaction: t,
      }
    );

    await t.commit();
    return res.status(200).json({ message: "Device deleted successfully." });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetRoomDevicesLog = async (req, res) => {
  const { device_type_id, date } = req.query;
  try {
    let whereClause = "WHERE 1=1";
    const replacements = {};

    if (device_type_id) {
      whereClause += " AND l.device_type_id = :device_type_id";
      replacements.device_type_id = device_type_id;
    }

    if (date) {
      whereClause += " AND l.created_at BETWEEN :started_at AND :ended_at";
      replacements.started_at = `${date} 00:00:00`;
      replacements.ended_at = `${date} 23:59:59`;
    }

    const logs = await sequelize.query(
      `
      SELECT 
        l.created_at AS created_at,
        r.floor AS floor,
        r.room_number AS room_number,
        d.name AS device_name,
        l.device_type_id AS device_type_id,
        l.action AS action,
        dc.name AS control_name,
        l.value AS value,
        l.actor_id,
        u.full_name AS user_name,
        u.role_id AS user_role_id,
        l.is_system AS is_system
      FROM device_logs l
      JOIN rooms r ON l.room_id = r.id
      JOIN devices d ON l.device_id = d.id
      JOIN device_types dt ON l.device_type_id = dt.id
      LEFT JOIN users u ON l.actor_id = u.id
      LEFT JOIN device_control dc 
        ON l.action = dc.control_id 
        AND l.device_id = dc.device_id 
        AND l.room_id = dc.room_id
      ${whereClause}
      ORDER BY l.created_at DESC
      `,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );
    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
