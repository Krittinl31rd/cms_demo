const ws_cmd = {
  LOGIN_GATEWAY: 1,
  LOGIN: 2,
  DATA_INIT: 3,
  MODBUS_STATUS: 4,
  DATA_UPDATE: 5,
  WRITE_REGISTER: 6,
  ROOM_STATUS_UPDATE: 7,
  FORWARD_UPDATE: 8,
  LOG_UPDATE: 9,
};

const client = {
  LOGIN: 2, // send  and receive
  MODBUS_STATUS: 4, // receive status modbus
  ROOM_STATUS_UPDATE: 7, // receive dnd mur guest check
  FORWARD_UPDATE: 8, // receive all data from modbus
  WRITE_REGISTER: 6, // send data to modbus
  LOG_UPDATE: 9, // receive devices logs
};

module.exports = { ws_cmd, client };
