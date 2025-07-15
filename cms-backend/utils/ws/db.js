const sequelize = require("../../config/db");
const { shouldLog } = require("../ws/logCache");
const { getWsClients } = require("../ws/wsClients");
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

// const insertToDB = async (data, source) => {
//   try {
//     await Promise.all(
//       data.map(async ({ device_id, control_id, value, room_id, type_id }) => {
//         if (type_id == 24 && [19, 20, 21, 22, 23, 24, 25].includes(control_id))
//           return;

//         let shouldInsert = false;

//         if ([20, 21, 22].includes(type_id)) {
//           shouldInsert = shouldLog(room_id, device_id, control_id, 18000); // 10 minutes
//         } else {
//           shouldInsert = true;
//         }
//         console.log(shouldInsert);
//         if (shouldInsert) {
//           await sequelize.query(
//             `INSERT INTO device_logs (room_id, device_id, device_type_id, value, actor_id, action)
//                VALUES (:room_id, :device_id, :device_type_id, :value, :actor_id, :action)`,
//             {
//               replacements: {
//                 room_id,
//                 device_id: device_id,
//                 device_type_id: type_id,
//                 action: control_id,
//                 value: value,
//                 actor_id: source == 0 ? null : source,
//               },
//               type: sequelize.QueryTypes.INSERT,
//             }
//           );
//         }
//       })
//     );
//   } catch (err) {
//     console.error("insertToDB error:", err);
//   }
// };

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
              const wsModbusClient = getWsClients().find(
                (client) => client.user.role !== "gateway"
              );
              console.log(`log: ${wsModbusClient}`);
              if (wsModbusClient) {
                wsModbusClient.socket.send(
                  JSON.stringify({
                    cmd: ws_cmd.LOG_UPDATE,
                    param: { data: latestLog },
                  })
                );
              }
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
      replacements.guest_status_id = roomStatus.guest_status_id == 0 ? 0 : 1;
    }
    if ("dnd_status" in roomStatus) {
      fields.push("dnd_status = :dnd_status");
      replacements.dnd_status = roomStatus.dnd_status;
    }
    if ("mur_status" in roomStatus) {
      fields.push("mur_status = :mur_status");
      replacements.mur_status = roomStatus.mur_status;
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

    // console.log("Room status updated:", roomStatus);
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
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  updatedToDB,
  insertToDB,
  updateRoomStatusInDB,
  updateIsOnline,
};
