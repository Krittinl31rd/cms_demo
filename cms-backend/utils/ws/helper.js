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

const deviceStatusCache = {}; // key = ip, value = { mur: 0|1, dnd: 0|1, lastSentRequestStatus: 0|1|2 }

const handleRoomStatusUpdate = async (ip, mappedData) => {
  const status = { ip };

  if (!deviceStatusCache[ip]) {
    deviceStatusCache[ip] = {
      mur: 0,
      dnd: 0,
      lastSentRequestStatus: -1,
      lastGuestStatusId: -1,
      lastRoomCheckStatus: -1,
    };
  }

  const current = deviceStatusCache[ip];
  let newMur = current.mur;
  let newDnd = current.dnd;

  for (const item of mappedData) {
    if (item.address == 5) {
      if (item.value === 1 || item.value === 2) newMur = 1;
      else if (item.value === 0) newMur = 0;
    }

    if (item.address == 6) {
      if (item.value === 1) newDnd = 1;
      else if (item.value === 0) newDnd = 0;
    }

    if (item.address == 75) {
      status.guest_status_id = item.value >= 1 ? 1 : 0;
    }

    if (item.address == 8) {
      status.room_check_status = item.value;
    }
  }

  // Update memory cache
  current.mur = newMur;
  current.dnd = newDnd;

  // Determine request_status
  let newRequestStatus = 0;
  if (newDnd === 1) newRequestStatus = 1;
  else if (newMur === 1) newRequestStatus = 2;

  let updated = false;

  if (
    "guest_status_id" in status &&
    status.guest_status_id !== current.lastGuestStatusId
  ) {
    updated = true;
    current.lastGuestStatusId = status.guest_status_id;
  }

  if (
    "room_check_status" in status &&
    status.room_check_status !== current.lastRoomCheckStatus
  ) {
    updated = true;
    current.lastRoomCheckStatus = status.room_check_status;
  }

  if (newRequestStatus !== current.lastSentRequestStatus) {
    updated = true;
    current.lastSentRequestStatus = newRequestStatus;
  }

  if (!updated) return null;

  status.request_status = newRequestStatus;
  return status;
};

module.exports = {
  mapChangedDataToDeviceControls,
  handleRoomStatusUpdate,
};
