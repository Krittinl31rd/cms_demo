const sequelize = require("../../config/db");
const { shouldLog } = require("../ws/logCache");
const { getWsClients, sendWsMessageToAll } = require("../ws/wsClients");
const { ws_cmd } = require("../../constants/wsCommand");

const updatedToDB = async (data) => {
  try {
    await Promise.all(
      data.map(async ({ device_id, control_id, value, room_id }) => {
        const [current] = await sequelize.query(
          `SELECT value FROM device_control
           WHERE room_id = :room_id AND device_id = :device_id AND control_id = :control_id`,
          {
            replacements: { room_id, device_id, control_id },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        if (!current || current.value !== value) {
          await sequelize.query(
            `UPDATE device_control SET value = :value, last_update = NOW()
             WHERE room_id = :room_id AND device_id = :device_id AND control_id = :control_id`,
            {
              replacements: { value, room_id, device_id, control_id },
              type: sequelize.QueryTypes.UPDATE,
            }
          );

          // console.log(
          //   Updated device_id=${device_id}, control_id=${control_id} to value=${value}
          // );
        }
      })
    );
  } catch (err) {
    console.error("updatedToDB error:", err);
  }
};

const insertToDB = async (data, source) => {
  // console.log(data, source);
  try {
    await Promise.all(
      data.map(
        async ({ device_id, control_id, value, room_id, type_id, system }) => {
          if (
            type_id == 24 &&
            [19, 20, 21, 22, 23, 24, 25].includes(control_id)
          )
            return;

          let shouldInsert = false;
          let isActor;
          let isSystem;

          if ([20, 21, 22].includes(type_id)) {
            shouldInsert = shouldLog(room_id, device_id, control_id, 6000);
            isActor = null;
            isSystem = 0;
          } else {
            shouldInsert = true;
            if (source == undefined) {
              isActor = null;
              isSystem = system;
            } else {
              isActor = source;
              isSystem = null;
            }
          }

          if (shouldInsert) {
            await sequelize.query(
              `INSERT INTO device_logs (room_id, device_id, device_type_id, value, actor_id, is_system, action)
             VALUES (:room_id, :device_id, :device_type_id, :value, :actor_id, :is_system, :action)`,
              {
                replacements: {
                  room_id,
                  device_id,
                  device_type_id: type_id,
                  value,
                  actor_id: isActor,
                  is_system: isSystem,
                  action: control_id,
                },
                type: sequelize.QueryTypes.INSERT,
              }
            );

            const logs = await sequelize.query(
              `
            SELECT
                l.id AS id,
                l.created_at AS created_at,
                r.floor AS floor,
                r.room_number AS room_number,
                d.name AS device_name,
                l.device_type_id AS device_type_id,
                l.action AS action,
                l.value AS value,
                l.actor_id,
                dc.name AS control_name,
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
            WHERE l.room_id = :room_id
              AND l.device_id = :device_id
              AND l.action = :control_id
            ORDER BY l.created_at DESC
            LIMIT 1
            `,
              {
                replacements: {
                  room_id,
                  device_id,
                  control_id,
                },
                type: sequelize.QueryTypes.SELECT,
              }
            );

            const latestLog = logs?.[0];
            console.log(latestLog);
            if (latestLog) {
              sendWsMessageToAll({
                cmd: ws_cmd.LOG_UPDATE,
                param: { data: latestLog },
              });
            }
          }
        }
      )
    );
  } catch (err) {
    console.error("insertToDB error:", err);
  }
};

const updateRoomStatusInDB = async (roomStatus) => {
  try {
    const fields = [];
    const replacements = { ip: roomStatus.ip };

    if ("guest_status_id" in roomStatus) {
      fields.push("guest_status_id = :guest_status_id");
      replacements.guest_status_id = roomStatus.guest_status_id;
    }
    if ("request_status" in roomStatus) {
      fields.push("request_status = :request_status");
      replacements.request_status = roomStatus.request_status;
    }
    if ("room_check_status" in roomStatus) {
      fields.push("room_check_status = :room_check_status");
      replacements.room_check_status = roomStatus.room_check_status;
    }

    if (fields.length == 0) return;

    const query = `
      UPDATE rooms
      SET ${fields.join(", ")}
      WHERE ip_address = :ip
    `;

    await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.UPDATE,
    });

    console.log("Room status updated:", roomStatus);
  } catch (err) {
    console.error("Failed to update room status:", err);
  }
};

const updateIsOnline = async (ip, status) => {
  try {
    await sequelize.query(
      `UPDATE rooms set is_online = :status WHERE ip_address = :ip`,
      {
        replacements: { ip, status },
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    // await handleInsertEvent(ip, status == 0 ? "rcu_offline" : "rcu_online");
  } catch (err) {
    console.log(err);
  }
};

const handleInsertEvent = async (ip = null, room_id = null, event) => {
  try {
    let room;
    if (ip != null) {
      const [result] = await sequelize.query(
        `SELECT id FROM rooms WHERE ip_address = :ip`,
        {
          replacements: { ip },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      room = result;
    } else if (room_id != null) {
      const [result] = await sequelize.query(
        `SELECT id FROM rooms WHERE id = :id`,
        {
          replacements: { id: room_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      room = result;
    }

    if (!room) {
      console.warn(`Room not found for IP: ${ip}`);
      return;
    }

    const roomId = room.id;

    const [insertResult] = await sequelize.query(
      `INSERT INTO rcu_event (room_id, event_type) VALUES (:room_id, :event_type)`,
      {
        replacements: {
          room_id: roomId,
          event_type: event,
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const getLastEventType = async (roomId, eventPrefix) => {
  const [last] = await sequelize.query(
    `SELECT event_type FROM guest_persence_logs 
     WHERE room_id = :room_id 
     AND event_type LIKE :event_prefix 
     ORDER BY id DESC LIMIT 1`,
    {
      replacements: {
        room_id: roomId,
        event_prefix: `${eventPrefix}_%`,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );
  return last?.event_type || null;
};

const insertGuestPersenceLogs = async (roomStatus) => {
  const { ip, room_check_status, guest_status_id, request_status } = roomStatus;

  try {
    const [room] = await sequelize.query(
      `SELECT id FROM rooms WHERE ip_address = :ip`,
      {
        replacements: { ip },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!room) {
      console.warn(`Room not found for IP: ${ip}`);
      return;
    }

    const roomId = room.id;
    const events = [];

    // Check In / Out
    if (typeof room_check_status !== "undefined") {
      const expectedEvent = room_check_status == 1 ? "check_in" : "check_out";
      const last = await getLastEventType(roomId, "check");
      if (last !== expectedEvent) {
        events.push({ event_type: expectedEvent });
      }
    }

    // Guest In / Out
    if (typeof guest_status_id !== "undefined") {
      const expectedEvent = guest_status_id == 1 ? "guest_in" : "guest_out";
      const last = await getLastEventType(roomId, "guest");
      if (last !== expectedEvent) {
        events.push({ event_type: expectedEvent });
      }
    }

    // Request Status
    if (typeof request_status !== "undefined") {
      // Current state from request_status
      const isDndNow = request_status === 1;
      const isMurNow = request_status === 2;

      // Last state from logs
      const lastDnd = await getLastEventType(roomId, "dnd"); // dnd_on หรือ dnd_off หรือ null
      const lastMur = await getLastEventType(roomId, "mur"); // mur_on หรือ mur_off หรือ null

      // DND Transition
      if (isDndNow && lastDnd !== "dnd_on") {
        events.push({ event_type: "dnd_on" });
      } else if (!isDndNow && lastDnd === "dnd_on") {
        events.push({ event_type: "dnd_off" });
      }

      // MUR Transition
      if (isMurNow && lastMur !== "mur_on") {
        events.push({ event_type: "mur_on" });
      } else if (!isMurNow && lastMur === "mur_on") {
        events.push({ event_type: "mur_off" });
      }
    }

    await Promise.all(
      events.map(async (event) => {
        const [insertResult] = await sequelize.query(
          `INSERT INTO guest_persence_logs (room_id, event_type) VALUES (:room_id, :event_type)`,
          {
            replacements: {
              room_id: roomId,
              event_type: event.event_type,
            },
            type: sequelize.QueryTypes.INSERT,
          }
        );

        const [rows] = await sequelize.query(
          `SELECT 
            guest_persence_logs.*,
            rooms.floor
            FROM guest_persence_logs
            INNER JOIN rooms ON guest_persence_logs.room_id = rooms.id
            WHERE guest_persence_logs.id = :id`,
          {
            replacements: { id: insertResult },
            type: sequelize.QueryTypes.SELECT,
          }
        );

        sendWsMessageToAll({
          cmd: 999,
          param: rows,
        });
      })
    );

    console.log(
      "Inserted guest presence logs:",
      events.map((e) => e.event_type)
    );
  } catch (err) {
    console.error("Failed to insert guest presence logs:", err);
  }
};

module.exports = {
  updatedToDB,
  insertToDB,
  updateRoomStatusInDB,
  updateIsOnline,
  insertGuestPersenceLogs,
  handleInsertEvent,
};
