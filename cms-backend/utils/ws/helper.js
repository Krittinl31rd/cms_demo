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

const deviceStatusCache = {}; // // key = ip, value = { mur, dnd, ... }

const handleRoomStatusUpdate = async (ip, mappedData) => {
  const status = { ip };

  if (!deviceStatusCache[ip]) {
    deviceStatusCache[ip] = {
      mur: 0,
      dnd: 0,
      lastSentRequestStatus: -1,
      lastGuestStatusId: -1,
      lastRoomCheckStatus: -1,
      hasCheckedInBefore: false,
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
  const { id, floor } = await checkRoomByIP(ip);
  if (id && floor) {
    status.request_status = newRequestStatus;
    status.room_id = id;
    status.floor = floor;

    return status;
  }
};

const checkRoomByIP = async (ip) => {
  try {
    const query = `SELECT id, floor  FROM rooms WHERE ip_address = :ip_address`;

    const [result] = await sequelize.query(query, {
      replacements: { ip_address: ip },
      type: sequelize.QueryTypes.SELECT,
    });

    return result ? result : {};
  } catch (err) {
    console.log(err);
  }
};

// const deviceStatusCache = {}; // key = ip, value = { mur, dnd, ... }

// const handleRoomStatusUpdate = async (ip, mappedData) => {
//   const status = { ip };

//   if (!deviceStatusCache[ip]) {
//     deviceStatusCache[ip] = {
//       mur: 0,
//       dnd: 0,
//       lastSentRequestStatus: -1,
//       lastGuestStatusId: -1,
//       lastRoomCheckStatus: -1,
//       hasCheckedInBefore: false, // <== เพิ่มตรงนี้
//     };
//   }

//   const current = deviceStatusCache[ip];
//   let newMur = current.mur;
//   let newDnd = current.dnd;
//   let roomCheckStatus = null;

//   for (const item of mappedData) {
//     if (item.address == 5) {
//       newMur = item.value === 1 || item.value === 2 ? 1 : 0;
//     }
//     if (item.address == 6) {
//       newDnd = item.value === 1 ? 1 : 0;
//     }
//     if (item.address == 75) {
//       status.guest_status_id = item.value >= 1 ? 1 : 0;
//     }
//     if (item.address == 8) {
//       roomCheckStatus = item.value;
//       status.room_check_status = roomCheckStatus;

//       // ตรวจสอบว่าห้องเคยเช็คอินไหม (ครั้งแรก)
//       if (!current.hasCheckedInBefore && (roomCheckStatus === 1 || roomCheckStatus === 2)) {
//         current.hasCheckedInBefore = true;
//       }
//     }
//   }

//   // Update memory cache
//   current.mur = newMur;
//   current.dnd = newDnd;

//   // Determine request_status
//   let newRequestStatus = 0;
//   if (newDnd === 1) newRequestStatus = 1;
//   else if (newMur === 1) newRequestStatus = 2;

//   let updated = false;

//   if (
//     "guest_status_id" in status &&
//     status.guest_status_id !== current.lastGuestStatusId
//   ) {
//     updated = true;
//     current.lastGuestStatusId = status.guest_status_id;
//   }

//   if (
//     "room_check_status" in status &&
//     (
//       status.room_check_status !== current.lastRoomCheckStatus ||
//       (!current.hasCheckedInBefore && (roomCheckStatus === 1 || roomCheckStatus === 2)) // ครั้งแรก
//     )
//   ) {
//     updated = true;
//     current.lastRoomCheckStatus = status.room_check_status;
//   }

//   if (newRequestStatus !== current.lastSentRequestStatus) {
//     updated = true;
//     current.lastSentRequestStatus = newRequestStatus;
//   }

//   if (!updated) return null;

//   status.request_status = newRequestStatus;
//   status.room_id = await checkRoomByIP(ip);
//   return status;
// };

// const deviceStatusCache = {}; // key = ip, value = { mur, dnd, lastSentRequestStatus, ... }

// const handleRoomStatusUpdate = async (ip, mappedData) => {
//   const status = { ip };

//   if (!deviceStatusCache[ip]) {
//     deviceStatusCache[ip] = {
//       mur: 0,
//       dnd: 0,
//       lastSentRequestStatus: -1,
//       lastGuestStatusId: -1,
//       lastRoomCheckStatus: 4, // default: assume guest checked out and left
//       everCheckedIn: false, // new: track whether room was ever checked-in
//     };
//   }

//   const current = deviceStatusCache[ip];
//   let newMur = current.mur;
//   let newDnd = current.dnd;
//   let roomCheckStatus = null;
//   let guestStatusId = null;

//   for (const item of mappedData) {
//     if (item.address == 5) {
//       if (item.value === 1 || item.value === 2) newMur = 1;
//       else if (item.value === 0) newMur = 0;
//     }

//     if (item.address == 6) {
//       if (item.value === 1) newDnd = 1;
//       else if (item.value === 0) newDnd = 0;
//     }

//     if (item.address == 75) {
//       // guest_status_id
//       // 1 = guest_in, 0 = guest_out, 2 = never checked-in
//       if (item.value === 1) guestStatusId = 1;
//       else if (item.value === 0) {
//         guestStatusId = current.everCheckedIn ? 0 : 2;
//       }
//     }

//     if (item.address == 8) {
//       // room_check_status: 0 = check-out, 1 = check-in, 2 = occupied, 4 = vacant
//       roomCheckStatus = item.value;

//       // once room_check_status is 1 (check-in), mark it
//       if (roomCheckStatus === 1) {
//         current.everCheckedIn = true;
//       }

//       // If room_check_status is 0 AND guestStatusId === 0, we assume guest left
//       // Override to 4 (vacant) if both conditions met
//       if (roomCheckStatus === 0 && guestStatusId === 0) {
//         roomCheckStatus = 4;
//       }
//     }
//   }

//   // Update memory cache
//   current.mur = newMur;
//   current.dnd = newDnd;

//   let newRequestStatus = 0;
//   if (newDnd === 1) newRequestStatus = 1;
//   else if (newMur === 1) newRequestStatus = 2;

//   let updated = false;

//   if (guestStatusId !== null && guestStatusId !== current.lastGuestStatusId) {
//     updated = true;
//     current.lastGuestStatusId = guestStatusId;
//     status.guest_status_id = guestStatusId;
//   }

//   if (
//     roomCheckStatus !== null &&
//     roomCheckStatus !== current.lastRoomCheckStatus
//   ) {
//     updated = true;
//     current.lastRoomCheckStatus = roomCheckStatus;
//     status.room_check_status = roomCheckStatus;
//   }

//   if (newRequestStatus !== current.lastSentRequestStatus) {
//     updated = true;
//     current.lastSentRequestStatus = newRequestStatus;
//   }

//   if (!updated) return null;

//   status.request_status = newRequestStatus;
//   status.room_id = await checkRoomByIP(ip);
//   return status;
// };

module.exports = {
  mapChangedDataToDeviceControls,
  handleRoomStatusUpdate,
};

// from modbus
// guest_status_id = address 7 - 0, 1
// room_check_status | check in/out = address 8 = 0, 1

// room_check_status : check_out=0, check_in=1, occupied=2, vacant=4
//  ถ้าห้องยังไม่เคยเช็คอินจะโชว์เป็น 0 ถ้าเช็คอินแล้วจะโชว์เป็น 1 ถ้าแขกเข้ามาแล้วจะโชว์เป็น 2 ถ้าเช็คเอาท์แล้วจะโชว์เป็น 0 และแขกออกไปแล้วจะโชว์เป็น 4
// ถ้าแขกออกไปแล้วจะโชว์เป็น 4  และ ก็วนแบบนี้ไปเรื่อยๆ
// แต่ตอนเริ่มเซิฟเวอร์ห้องที่เช็คเอ้าท์และแขกออกให้เป็น 4

// guest_status_id : guest_out=0, guest_in=1, not_checkin=2
// แขกเข้ามาให้เป็น 1 ถ้าแขกออกไปแล้วให้เป็น 0 และถ้าไม่เคยเช็คอินเลยให้เป็น 2
