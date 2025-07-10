require("dotenv").config();
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const {
  updatedToDB,
  insertToDB,
  updateRoomStatusInDB,
  updateIsOnline,
} = require("./utils/ws/db");
const {
  mapChangedDataToDeviceControls,
  handleRoomStatusUpdate,
} = require("./utils/ws/helper");
const { GatewayLogin } = require("./controllers/authController");
const { addWsClient, getWsClients } = require("./utils/ws/wsClients");
// const { roomStatusCache } = require("./utils/ws/helper");
const { ws_cmd } = require("./constants/wsCommand");

const wss = new WebSocket.Server({ port: process.env.WS_PORT });
console.log(`WebSocket server started on port ${process.env.WS_PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");
  const infoClient = {
    id: uuidv4(),
    socket: ws,
    lastTimestamp: Date.now(),
    isLogin: false,
    ip: null,
    user: null,
    updated: false,
  };
  addWsClient(infoClient);

  ws.on("message", async (message) => {
    try {
      const { cmd, param } = JSON.parse(message);
      // console.log(cmd, param);

      if (cmd == ws_cmd.LOGIN_GATEWAY) {
        const { username, password } = param;
        if (infoClient.isLogin) {
          return ws.send(
            JSON.stringify({
              cmd: ws_cmd.LOGIN_GATEWAY,
              param: { status: "success", message: "Already logged in" },
            })
          );
        }

        try {
          const { token } = await GatewayLogin(username, password);
          const decoded = await jwt.verify(token, process.env.JWT_SECRET);
          infoClient.isLogin = true;
          infoClient.user = decoded;
          console.log(`Client ${infoClient.id} login success`);

          ws.send(
            JSON.stringify({
              cmd: ws_cmd.LOGIN_GATEWAY,
              param: {
                status: "success",
                message: "Login successful",
                clientId: infoClient.id,
              },
            })
          );
          return;
        } catch (err) {
          ws.send(
            JSON.stringify({
              cmd: ws_cmd.LOGIN_GATEWAY,
              param: {
                status: "error",
                message: err.message,
              },
            })
          );
        }
      }

      if (cmd == ws_cmd.LOGIN) {
        const { token } = param;
        if (infoClient.isLogin) {
          return ws.send(
            JSON.stringify({
              cmd: ws_cmd.LOGIN,
              param: { status: "success", message: "Already logged in" },
            })
          );
        }
        try {
          const decoded = await jwt.verify(token, process.env.JWT_SECRET);
          infoClient.isLogin = true;
          infoClient.user = decoded;
          console.log(`Client ${infoClient.id} login success`);
          ws.send(
            JSON.stringify({
              cmd: ws_cmd.LOGIN,
              param: {
                status: "success",
                message: "Login successful",
                clientId: infoClient.id,
              },
            })
          );
          // setTimeout(() => {
          //   const wsModbusClient = getWsClients().find(
          //     (client) => client?.user?.role == "gateway"
          //   );
          //   if (wsModbusClient != undefined) {
          //     wsModbusClient.socket.send(
          //       JSON.stringify({
          //         cmd: ws_cmd.MODBUS_STATUS,
          //         param: {},
          //       })
          //     );
          //   }
          // }, 500);
          return;
        } catch (err) {
          console.log(`Client ${infoClient.id} login failed: ${err.message}`);
          return ws.send(
            JSON.stringify({
              cmd: ws_cmd.LOGIN,
              param: { status: "error", message: "Invalid token" },
            })
          );
        }
      }

      if (infoClient.isLogin == false) {
        return ws.send(
          JSON.stringify({
            cmd: ws_cmd.LOGIN,
            param: {
              status: "error",
              message: "Unauthorized. Please login first.",
            },
          })
        );
      }

      if (cmd == ws_cmd.MODBUS_STATUS) {
        if (param.ip && typeof param.status !== "undefined") {
          console.log(`ip ${param.ip} status ${param.status}`);
          await updateIsOnline(param.ip, param.status);
          broadcastToLoggedInClients(
            JSON.stringify({
              cmd: ws_cmd.MODBUS_STATUS,
              param,
            })
          );
        }
      }

      if (cmd == ws_cmd.DATA_INIT) {
        const { ip, changedData } = param;
        const mappedData = await mapChangedDataToDeviceControls(
          ip,
          changedData
        );
        await updatedToDB(mappedData);
        const roomStatus = await handleRoomStatusUpdate(ip, mappedData);
        if (roomStatus) {
          await updateRoomStatusInDB(roomStatus);
        }
      }

      if (cmd == ws_cmd.DATA_UPDATE) {
        const { ip, data: changedData, source } = param;
        // console.log(`Data from ${ip} by ${source}:`, changedData);
        const mappedData = await mapChangedDataToDeviceControls(
          ip,
          changedData
        );
        await updatedToDB(mappedData);

        const roomStatus = await handleRoomStatusUpdate(ip, mappedData);

        if (roomStatus) {
          await updateRoomStatusInDB(roomStatus);
          broadcastToLoggedInClients(
            JSON.stringify({
              cmd: ws_cmd.ROOM_STATUS_UPDATE,
              param: { data: roomStatus },
            })
          );
        }

        await insertToDB(mappedData, source);

        broadcastToLoggedInClients(
          JSON.stringify({
            cmd: ws_cmd.FORWARD_UPDATE,
            param: { ip, data: mappedData },
          })
        );
        return;
      }

      if (cmd == ws_cmd.WRITE_REGISTER) {
        const wsModbusClient = getWsClients().find(
          (client) => client.user.role == "gateway"
        );
        if (wsModbusClient == undefined) {
          return ws.send(
            JSON.stringify({
              cmd: ws_cmd.WRITE_REGISTER,
              param: {
                status: "error",
                message: "Modbus client not connected",
              },
            })
          );
        }
        wsModbusClient.socket.send(
          JSON.stringify({
            cmd: ws_cmd.WRITE_REGISTER,
            param: {
              ip: param.ip,
              address: param.address,
              value: param.value,
              slaveId: param.slaveId,
              fc: param.fc,
              userId: infoClient.user.id,
            },
          })
        );
        console.log(`Send Write to ModbusClient: `, param);
        return;
      }
    } catch (err) {
      console.error("Error processing message:", err);
      ws.send(
        JSON.stringify({
          cmd: "error",
          param: { status: "error", message: "Invalid message format" },
        })
      );
    }
  });

  ws.on("close", () => {
    console.log(`Client ${infoClient.id} disconnected`);
    const index = getWsClients().findIndex(
      (client) => client.id === infoClient.id
    );
    if (index !== -1) {
      getWsClients().splice(index, 1);
    }
  });
});

function broadcastToLoggedInClients(message) {
  getWsClients().forEach((client) => {
    if (
      client.isLogin &&
      client.user.role != "gateway" &&
      client.socket.readyState === WebSocket.OPEN
    ) {
      client.socket.send(message);
    }
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
