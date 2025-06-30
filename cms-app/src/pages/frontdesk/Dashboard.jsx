import React, { useEffect, useState, useMemo, useRef } from "react";
import Button from "@/components/ui/button";
import Spinner from "@/components/ui/Spinner";
import { GetRooms } from "@/api/room";
import useStore from "@/store/store";
import { device_type } from "../../constant/common";
import { NotepadText, DoorClosed, BrushCleaning, Bubbles } from "lucide-react";
import { CheckFunctionModbus } from "@/utilities/helpers";

const CONTROL_ID_FAN = 2;
const CONTROL_ID_TEMP = 3;

const Dashboard = () => {
  const { token } = useStore((state) => state);
  const [roomList, setRoomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);

  const guestBgColor = {
    0: "bg-guest_out",
    1: "bg-guest_in",
  };
  const checkBgColor = {
    0: "bg-check_out",
    1: "bg-check_in",
  };
  const cleanBgColor = {
    1: "bg-dirty",
    2: "bg-clean",
  };

  const fetchRoomList = async () => {
    setLoading(true);
    try {
      const response = await GetRooms(token);
      setRoomList(response?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomList();
  }, [token]);

  const toggleRoom = (id) => {
    setSelectedRooms((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Memoized summary calculations
  const summary = useMemo(() => {
    const devices = roomList.flatMap((room) => room.devices || []);
    const airDevices = devices.filter((d) => d.type_id === device_type.AIR);
    const fanSpeeds = airDevices
      .map((d) =>
        Array.isArray(d.controls)
          ? d.controls.find((c) => c.control_id === CONTROL_ID_FAN)?.value
          : undefined
      )
      .filter((v) => v !== undefined && v !== null);
    const fanCount = [0, 0, 0, 0]; // [off, low, med, high]
    fanSpeeds.forEach((v) => {
      const idx = Number(v);
      if (idx >= 0 && idx <= 3) fanCount[idx]++;
    });
    const total = fanSpeeds.length;
    const percent = fanCount.map((count) =>
      total > 0 ? ((count / total) * 100).toFixed(0) : "0"
    );
    const fanLabels = ["Fan Off", "Fan Low", "Fan Med", "Fan High"];

    const guestCount = roomList.reduce(
      (acc, room) => {
        if (room.guest_status_id === 1) acc.guestIn++;
        if (room.guest_status_id === 0) acc.guestOut++;
        return acc;
      },
      { guestIn: 0, guestOut: 0 }
    );
    const guestLabels = ["Guest In", "Guest Out"];
    const guestCountArray = [guestCount.guestIn, guestCount.guestOut];
    const guestPercent = guestCountArray.map((count) =>
      roomList.length > 0 ? ((count / roomList.length) * 100).toFixed(0) : "0"
    );

    const dndCount = roomList.filter((r) => r.dnd_status == 1).length;
    const murCount = roomList.filter((r) => r.mur_status == 1).length;
    const dndPercent =
      roomList.length > 0
        ? ((dndCount / roomList.length) * 100).toFixed(0)
        : "0";
    const murPercent =
      roomList.length > 0
        ? ((murCount / roomList.length) * 100).toFixed(0)
        : "0";

    return {
      fanLabels,
      fanCount,
      percent,
      guestLabels,
      guestCountArray,
      guestPercent,
      dndCount,
      murCount,
      dndPercent,
      murPercent,
    };
  }, [roomList]);

  // Helper for fan speed label
  const getFanSpeedLabel = (value) => {
    switch (value) {
      case 1:
        return "L";
      case 2:
        return "M";
      case 3:
        return "H";
      default:
        return "";
    }
  };

  useEffect(() => {
    ws.current = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
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
      sendWebSocketMessage({ cmd: "login", param: { token } });
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
      case "login":
        if (param.status === "success") {
          console.log("Login success");
        }
        break;

      case "modbus_status": {
        if (Array.isArray(param.data)) {
          setRoomList((prevRooms) =>
            prevRooms.map((room) => {
              const match = param.data.find(
                (item) => item.ip == room.ip_address
              );
              return match ? { ...room, is_online: match.status } : room;
            })
          );
        } else if (param.ip) {
          setRoomList((prevRooms) =>
            prevRooms.map((room) =>
              room.ip_address === param.ip
                ? { ...room, is_online: param.status }
                : room
            )
          );
        }
        break;
      }

      case "room_status_update": {
        if (param.data) {
          const roomStatus = param.data;

          setRoomList((prevRooms) =>
            prevRooms.map((room) => {
              if (room.ip_address == roomStatus.ip) {
                return {
                  ...room,
                  ...(roomStatus.guest_status_id != undefined && {
                    guest_status_id: roomStatus.guest_status_id,
                  }),
                  ...(roomStatus.dnd_status != undefined && {
                    dnd_status: roomStatus.dnd_status,
                  }),
                  ...(roomStatus.mur_status != undefined && {
                    mur_status: roomStatus.mur_status,
                  }),
                  ...(roomStatus.room_check_status != undefined && {
                    room_check_status: roomStatus.room_check_status,
                  }),
                };
              }
              return room;
            })
          );
        }
        break;
      }

      case "forward_update": {
        const { data } = param;
        if (!Array.isArray(data) || data.length === 0) return;
        setRoomList((prevRooms) => {
          const newRooms = prevRooms.map((room) => {
            const updatedDevices = room.devices.map((device) => {
              let deviceChanged = false;
              const newControls = device.controls.map((control) => {
                const updateItem = data.find(
                  (item) =>
                    item.room_id == room.room_id &&
                    item.device_id == device.device_id &&
                    item.control_id == control.control_id
                );
                if (updateItem) {
                  deviceChanged = true;
                  return {
                    ...control,
                    value: updateItem.value,
                    // last_update: new Date().toISOString(),
                  };
                }
                return control;
              });

              if (deviceChanged) {
                return { ...device, controls: newControls };
              }
              return device;
            });

            return { ...room, devices: updatedDevices };
          });

          return newRooms;
        });

        break;
      }

      default:
        break;
    }
  };

  const handleChekIn = (status) => {
    if (selectedRooms.length == 0) return;
    selectedRooms.forEach((roomId) => {
      const room = roomList.find((r) => r.room_id === roomId);
      if (!room) return;
      const device = room.devices.find(
        (d) =>
          d.type_id == device_type.DNDMUR && d.device_name == "Check-IN/OUT"
      );
      if (!device) return;
      const ctrlStatus = device.controls.find((d) => d.control_id == 1);
      const addressStatus = device.controls.find((d) => d.control_id == 101);

      if (ctrlStatus.value == status) return;

      const { address, funct } = CheckFunctionModbus(addressStatus.value);

      sendWebSocketMessage({
        cmd: "write_register",
        param: {
          address: address,
          value: status,
          slaveId: 1,
          ip: room.ip_address,
          fc: funct == 30000 ? 6 : funct == 10000 ? 5 : 0,
        },
      });
    });
    // setSelectedRooms([]);
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 h-[calc(100%-0px)]">
      <div className="md:w-1/6 bg-white rounded-lg shadow-lg hidden md:flex md:flex-col p-2 gap-1 overflow-auto">
        <h6>Building Summary</h6>
        <div className="border border-gray-300 rounded-lg">
          <div className="flex flex-col gap-1 p-2 text-sm">
            {summary.fanLabels.map((label, i) => (
              <div className="grid grid-cols-3" key={label}>
                <span className="font-semibold">{label}</span>
                <span className="font-semibold text-end">
                  {summary.fanCount[i]}
                </span>
                <span className="font-semibold text-end">
                  {summary.percent[i]}%
                </span>
              </div>
            ))}
            {summary.guestLabels.map((label, i) => (
              <div className="grid grid-cols-3" key={label}>
                <span className="font-semibold">{label}</span>
                <span className="font-semibold text-end">
                  {summary.guestCountArray[i]}
                </span>
                <span className="font-semibold text-end">
                  {summary.guestPercent[i]}%
                </span>
              </div>
            ))}
            <div className="grid grid-cols-3">
              <span className="font-semibold text-dnd">DND</span>
              <span className="font-semibold text-end">{summary.dndCount}</span>
              <span className="font-semibold text-end">
                {summary.dndPercent}%
              </span>
            </div>
            <div className="grid grid-cols-3">
              <span className="font-semibold text-mur">MUR</span>
              <span className="font-semibold text-end">{summary.murCount}</span>
              <span className="font-semibold text-end">
                {summary.murPercent}%
              </span>
            </div>
          </div>
        </div>
        <div>
          <h6>Event Log</h6>
          <select
            id="service"
            className="w-full max-w-sm border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={106}>Do Not Disturb</option>
            <option value={110}>Make Up Room</option>
          </select>
        </div>
        <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg overflow-auto">
          {/* Event log content here */}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="h-[125px] bg-white border-t-4 border-t-check_in rounded-lg p-4 flex items-center justify-between shadow-lg">
            <div className="flex-1 space-y-1">
              <h6 className="text-3xl font-bold">12</h6>
              <h6 className="text-sm font-semibold text-gray-400">
                Today's Check-In
              </h6>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-check_in">
              <NotepadText />
            </div>
          </div>
          <div className="h-[125px] bg-white border-t-4 border-t-check_out rounded-lg p-4 flex items-center justify-between shadow-lg">
            <div className="flex-1 space-y-1">
              <h6 className="text-3xl font-bold">12</h6>
              <h6 className="text-sm font-semibold text-gray-400">
                Today's Check-Out
              </h6>
            </div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-check_out">
              <DoorClosed />
            </div>
          </div>
        </div>
        <div className="flex items-center bg-white rounded-lg shadow-lg p-2 gap-2 flex-wrap">
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <label htmlFor="room" className="text-xs font-semibold">
                Room
              </label>
              <input
                id="room"
                type="text"
                className="w-32 border border-gray-300 rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <label htmlFor="floor" className="text-xs font-semibold">
                Floor
              </label>
              <select
                id="floor"
                className="w-full max-w-sm border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={106}>106</option>
                <option value={110}>110</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleChekIn(1)}
              disabled={selectedRooms.length == 0}
              className={`inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl transition  bg-check_in ${
                selectedRooms.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              Check-IN
            </button>
            <button
              onClick={() => handleChekIn(0)}
              className={`inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl transition  bg-check_out ${
                selectedRooms.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              Check-OUT
            </button>
          </div>
          <div>|</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSelectedRooms(roomList.map((r) => r.room_id))}
              variant="gray"
            >
              Select all
            </Button>
            <Button onClick={() => setSelectedRooms([])} variant="gray">
              Clear
            </Button>
          </div>
        </div>
        <div className="w-full h-full bg-white rounded-lg shadow-lg flex flex-col overflow-auto gap-2 p-2">
          {loading ? (
            <div className="text-center py-10">
              <Spinner size="lg" />
              <p className="mt-2 text-gray-500 text-sm">Loading rooms...</p>
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))]">
              {roomList.map((item) => (
                <div
                  key={item.room_id}
                  onClick={() => toggleRoom(item.room_id)}
                  className={`h-[125px] rounded-xl flex flex-col cursor-pointer ${
                    item.dnd_status == 1
                      ? "bg-dnd/20"
                      : item.mur_status == 1
                      ? "bg-mur/20"
                      : "bg-gray-50"
                  } ${
                    selectedRooms.includes(item.room_id)
                      ? "border-4 border-black"
                      : "border border-gray-200"
                  }`}
                >
                  <div className="flex items-center px-2 pt-2 shrink-0">
                    <div
                      className={`w-12 h-12 inline-flex items-center justify-center ${
                        cleanBgColor[item.cleaning_status_id]
                      } rounded-full`}
                    >
                      {item.cleaning_status_id === 1 ? (
                        <Bubbles className="text-white" />
                      ) : item.cleaning_status_id == 2 ? (
                        <BrushCleaning className="text-white" />
                      ) : null}
                    </div>
                    <div className="flex-1 text-center">
                      <span
                        className={`font-semibold text-xl ${
                          item.is_online === 0 ? "text-red-500" : "text-black"
                        }`}
                      >
                        {item.floor}
                        {String(item.room_number).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          sendWebSocketMessage({
                            cmd: "write_register",
                            param: {
                              address: 6,
                              value: item.dnd_status == 0 ? 1 : 0,
                              slaveId: 1,
                              ip: item.ip_address,
                              fc: 6,
                            },
                          });
                        }}
                        className={`border p-0.5`}
                      >
                        DND
                      </button>
                      <button
                        onClick={() => {
                          sendWebSocketMessage({
                            cmd: "write_register",
                            param: {
                              address: 5,
                              value: item.mur_status == 0 ? 1 : 0,
                              slaveId: 1,
                              ip: item.ip_address,
                              fc: 6,
                            },
                          });
                        }}
                        className={`border p-0.5`}
                      >
                        MUR
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto px-2 py-1 max-h-[125px]">
                    <div className="w-full flex items-start gap-1">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-4 h-4 rounded-full ${
                              checkBgColor[item.room_check_status]
                            }`}
                          ></span>
                          <span className="font-semibold">
                            {item.room_check_status === 1
                              ? "Check-IN"
                              : item.room_check_status === 0
                              ? "Check-OUT"
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-4 h-4 rounded-full ${
                              guestBgColor[item.guest_status_id]
                            }`}
                          ></span>
                          <span className="font-semibold">
                            {item.guest_status_id === 1
                              ? "Guest-IN"
                              : item.guest_status_id === 0
                              ? "Guest-OUT"
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      {item.devices &&
                        item.devices
                          .filter((d) => d.type_id == device_type.AIR)
                          .map((dev) => {
                            const speedControl = dev.controls.find(
                              (c) => c.control_id == CONTROL_ID_FAN
                            );
                            const tempControl = dev.controls.find(
                              (c) => c.control_id == CONTROL_ID_TEMP
                            );
                            return (
                              <div
                                className="text-sm font-semibold"
                                key={dev.device_id}
                              >
                                <span>
                                  {getFanSpeedLabel(
                                    Number(speedControl?.value)
                                  )}{" "}
                                </span>
                                <span>{tempControl?.value || "N/A"} °C</span>
                              </div>
                            );
                          })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
