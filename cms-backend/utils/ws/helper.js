const skipAddresses = [30049, 30050, 30051, 30052, 30053, 30054, 30055];
const sequelize = require("../../config/db");
// const roomStatusCache = new Map();

const mapChangedDataToDeviceControls = async (ip_address, changedData) => {
  try {
    const rooms = await sequelize.query(
      `SELECT id FROM rooms WHERE ip_address = :ip_address`,
      {
        replacements: { ip_address },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (rooms.length === 0) return [];

    const roomIds = rooms.map((r) => r.id);

    const controls = await sequelize.query(
      `SELECT dc.room_id, dc.device_id, dc.control_id, dc.value, d.type_id
       FROM device_control dc
       JOIN devices d ON dc.device_id = d.id
       WHERE dc.room_id IN (:roomIds)`,
      {
        replacements: { roomIds },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const valueMap = new Map();
    const controlIdMap = new Map();

    controls.forEach((ctrl) => {
      if (ctrl.value !== null) {
        valueMap.set(`${ctrl.value}|${ctrl.room_id}`, ctrl);
      }
      controlIdMap.set(
        `${ctrl.control_id}|${ctrl.device_id}|${ctrl.room_id}`,
        ctrl
      );
    });

    const mappedData = [];

    changedData.forEach((item) => {
      if (skipAddresses.includes(item.address)) return;
      if (![1, 2, 3, 4].includes(item.fc)) return;

      const virtualControlId = item.fc * 10000 + item.address;

      let virtualControl = null;
      let matchedRoomId = null;

      for (const roomId of roomIds) {
        const key = `${virtualControlId}|${roomId}`;
        if (valueMap.has(key)) {
          virtualControl = valueMap.get(key);
          matchedRoomId = roomId;
          break;
        }
      }
      if (!virtualControl) return;

      const targetControlId = virtualControl.control_id - 100;
      const targetKey = `${targetControlId}|${virtualControl.device_id}|${matchedRoomId}`;
      const targetControl = controlIdMap.get(targetKey);
      if (!targetControl) return;

      mappedData.push({
        room_id: matchedRoomId,
        device_id: targetControl.device_id,
        type_id: targetControl.type_id,
        control_id: targetControl.control_id,
        value: item.value,
        system: item.system,
        address: item.address,
      });
    });

    return mappedData;
  } catch (err) {
    console.error("mapChangedDataToDeviceControls error:", err);
    return [];
  }
};

// guest_status_id = address 7
// dnd_status = address 6, mur_status = address 5,
// room_check_status | check in/out = address 8

const handleRoomStatusUpdate = async (ip, mappedData) => {
  const status = { ip };

  for (const item of mappedData) {
    if (item.address == 5) {
      status.mur_status = item.value;
    }
    if (item.address == 6) {
      status.dnd_status = item.value;
    }
    if (item.address == 75) {
      status.guest_status_id = item.value;
    }
    if (item.address == 8) {
      status.room_check_status = item.value;
    }
  }

  return Object.keys(status).length > 1 ? status : null;
};

module.exports = {
  mapChangedDataToDeviceControls,
  handleRoomStatusUpdate,
};
