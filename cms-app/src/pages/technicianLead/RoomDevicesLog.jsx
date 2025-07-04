import React, { useState, useEffect, useMemo, useRef } from "react";
import { GetRoomDevicesLog } from "@/api/room";
import useStore from "@/store/store";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import ModalPopup from "@/components/ui/ModalPopup";
import Button from "@/components/ui/Button";
import { device_type, member_role } from "../../constant/common";
import { client } from "@/constant/wsCommand";
import {
  Calendar,
  MapPin,
  Building,
  User,
  Settings,
  Crown,
  UserCheck,
  Bot,
  Clock,
} from "lucide-react";

const RoomDevicesLog = () => {
  const { token } = useStore((state) => state);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);
  const [logList, setLoglist] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("all");

  const fetchLog = async () => {
    try {
      const response = await GetRoomDevicesLog(token);
      setLoglist(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLog();
  }, []);

  const roomOptions = useMemo(() => {
    const rooms = logList.map((log) => ({
      value: log.room_number,
      label: `Room ${log.room_number} (Floor ${log.floor})`,
    }));
    const uniqueRooms = Array.from(
      new Map(rooms.map((r) => [r.value, r])).values()
    );
    return [{ value: "all", label: "All Rooms" }, ...uniqueRooms];
  }, [logList]);

  const filteredLogs = useMemo(() => {
    if (selectedRoom === "all") return logList;
    return logList.filter((log) => log.room_number === selectedRoom);
  }, [logList, selectedRoom]);

  useEffect(() => {
    ws.current = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.current.onopen = () => {
      // console.log('WebSocket Connected');
      setIsWsReady(true);
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleCommand(msg);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.current.onclose = () => {
      // console.log('WebSocket Disconnected');
      setIsWsReady(false);
    };

    return () => {
      ws.current.close();
    };
  }, [token]);

  useEffect(() => {
    if (isWsReady && token) {
      sendWebSocketMessage({ cmd: client.LOGIN, param: { token } });
    }
  }, [isWsReady, token]);

  const sendWebSocketMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      // console.warn('WebSocket not open, retrying...');
      setTimeout(() => sendWebSocketMessage(message), 500);
    }
  };

  const handleCommand = (msg) => {
    const { cmd, param } = msg;
    switch (cmd) {
      case client.LOG_UPDATE:
        if (param && param.data) {
          const newLog = param.data;
          // console.log("New log received:", newLog);
          setLoglist((prevLogs) => {
            const isDuplicate = prevLogs.some((log) => log.id == newLog.id);
            if (isDuplicate) {
              return prevLogs.map((log) =>
                log.id === newLog.id ? newLog : log
              );
            }
            return [newLog, ...prevLogs];
          });
        } else {
          console.error("Received invalid log data:", param);
        }
        break;
    }
  };

  const columns = [
    {
      header: (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Date & Time</span>
        </div>
      ),
      accessor: "created_at",
      cell: (row) => {
        const date = dayjs(row.created_at);
        return (
          <div className="flex items-center gap-1">
            <span className="font-medium ">
              {date.format("DD  MMMM YYYY")} {date.format("HH:mm:ss")}
            </span>
          </div>
        );
      },
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Location</span>
        </div>
      ),
      accessor: "room_number",
      cell: (row) => {
        return (
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Room</span>
            <div>
              <span className="font-semibold">{row.floor}</span>
              <span className="font-semibold">{row.room_number}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: (
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>Action</span>
        </div>
      ),
      accessor: "device_name",
      cell: (row) => {
        let labelName = row.device_name;
        let labelEnvent = "change to";
        let labelValue;
        const value = row.value;

        switch (row.device_type_id) {
          case device_type.AIR: {
            if (row.action == 2) {
              // fan speed
              const label = {
                0: "OFF",
                1: "LOW",
                2: "MED",
                3: "HIGH",
              };
              labelEnvent = "fan speed set to";
              if (value == 0) {
                labelEnvent = "power";
                labelValue = label[value];
              } else {
                labelValue = label[value];
              }
            } else if (row.action == 3) {
              //  aite temp
              labelEnvent = `temperature set to`;
              labelValue = `${value} ℃`;
            }
            break;
          }

          case device_type.POWER: {
            const controlMap = [
              { id: 1, unit: "Volt", name: "Voltage", scale: 10 },
              { id: 2, unit: "Amp", name: "Current", scale: 1000 },
              { id: 3, unit: "Watt", name: "Power", scale: 10 },
              { id: 4, unit: "", name: "Power Factor", scale: 100 },
              { id: 5, unit: "Kwh", name: "Energy", scale: 100 },
              { id: 6, unit: "Hz", name: "Frequency", scale: 10 },
            ];
            const target = controlMap.find((c) => c.id == row.action);
            if (target) {
              labelEnvent = `${target.name} change to`;
              labelValue =
                value != null
                  ? `${(value / target.scale).toFixed(2)} ${target.unit}`
                  : "N/A";
            } else {
              labelValue = "N/A";
            }

            break;
          }

          case device_type.AIR_QAULITY: {
            const controlMap = [
              { id: 1, unit: "µg/m³", name: "PM2.5" },
              { id: 2, unit: "ppm", name: "CO2" },
              { id: 3, unit: "ppb", name: "TVOC" },
              { id: 4, unit: "ppb", name: "HCHO" },
              { id: 5, unit: "℃", name: "Temperature" },
              { id: 6, unit: "%", name: "Humudity" },
            ];
            const target = controlMap.find((c) => c.id == row.action);
            if (target) {
              labelEnvent = `${target.name} change to`;
              labelValue =
                value != null
                  ? `${(value / target.scale).toFixed(2)} ${target.unit}`
                  : "N/A";
            } else {
              labelValue = "N/A";
            }

            break;
          }

          case device_type.DIMMER: {
            if (row.action == 2) {
              labelEnvent = "brightness set to";
              labelValue = `${value} %`;
            }
            break;
          }

          case device_type.LIGHTING: {
            if (row.action == 1) {
              labelEnvent = "light is";
              value == 0
                ? (labelValue = "OFF")
                : value == 1
                ? (labelValue = "ON")
                : (labelValue = "N/A");
            }
            break;
          }

          case device_type.MOTION: {
            if (row.action == 1) {
              if (row.device_name == "PIR") {
                labelEnvent = "motion is";
                value == 0
                  ? (labelValue = "No detected")
                  : value == 1
                  ? (labelValue = "Detected")
                  : (labelValue = "N/A");
              } else if (row.device_name == "Door contact") {
                labelEnvent = "door is";
                value == 0
                  ? (labelValue = "Closed")
                  : value == 1
                  ? (labelValue = "Opened")
                  : (labelValue = "N/A");
              }
            }
            break;
          }

          case device_type.ACCESS: {
            if (row.action == 1) {
              labelEnvent = "is";
              value == 0
                ? (labelValue = "Remove")
                : value == 1
                ? (labelValue = "Inserted")
                : (labelValue = "N/A");
            }
            break;
          }

          case device_type.DNDMUR: {
            if (row.action == 1) {
              if (row.device_name == "Check-IN/OUT") {
                labelEnvent = "";
                labelName = "";
                value == 0
                  ? (labelValue = "Check OUT")
                  : value == 1
                  ? (labelValue = "Check IN")
                  : (labelValue = "N/A");
              } else {
                labelEnvent = "is";
                value == 0
                  ? (labelValue = "ON")
                  : value == 1
                  ? (labelValue = "OFF")
                  : (labelValue = "N/A");
              }
            }
            break;
          }

          case device_type.TEMPERATURE: {
            if (row.action == 1) {
              labelEnvent = "change to";
              labelValue = `${(value / 10).toFixed(1)}`;
            }
            break;
          }

          case device_type.CONFIG: {
            labelEnvent = `set ${row.control_name.toLowerCase()}  to`;
            break;
          }
        }

        return (
          <div className="flex items-center gap-1">
            <span className="font-medium">{labelName}</span>{" "}
            <span className="text-sm text-gray-600">{labelEnvent}</span>
            <span className=" text-sm font-medium">
              {labelValue ? labelValue : value}
            </span>
          </div>
        );
      },
    },
    {
      header: (
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>Performed By</span>
        </div>
      ),
      accessor: "actor_id",
      cell: (row) => {
        if (row?.actor_id) {
          const roleLabel =
            Object.entries(member_role)
              .find(([key, value]) => value == row.user_role_id)?.[0]
              ?.replace(/_/g, " ") || "UNKNOW";
          return (
            <div className="flex items-center gap-1">
              <span className="font-medium">{row.user_name}</span>{" "}
              <span className="text-xs text-gray-500">({roleLabel})</span>
            </div>
          );
        } else {
          const systemLabel =
            row?.is_system == 0
              ? "SYSTEM"
              : row?.is_system == -1
              ? "GUEST"
              : "UNKNOW";
          return (
            <div className="flex items-center gap-1">
              <span className="font-medium">{systemLabel}</span>
            </div>
          );
        }
      },
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 bg-white px-2 py-4 shadow-md rounded-lg">
        <label htmlFor="room-filter" className="text-sm text-gray-700">
          Filter by Room:
        </label>
        <select
          id="room-filter"
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {roomOptions.map((room) => (
            <option key={room.value} value={room.value}>
              {room.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={filteredLogs} enableSearch={true} />
    </div>
  );
};

export default RoomDevicesLog;
