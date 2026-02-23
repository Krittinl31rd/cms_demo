import React, { useEffect, useState, useRef } from "react";
import { Plus, Copy, Save, Settings, Check, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { GetRooms } from "@/api/room";
import useStore from "@/store/store";
import { device_type } from "@/constant/common";
import { CheckFunctionModbus } from "@/utilities/helpers";
import { toast } from "react-toastify";
import { client } from "@/constant/wsCommand";
import { useNavigate, NavLink, useLocation, matchPath } from "react-router-dom";

const ExcelTable = ({ title, rows, onChange, mode, onModeChange }) => (
  <div className="overflow-x-auto">
    <div className="flex justify-between items-center mb-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="flex gap-2">
        <button
          className={`px-2 py-1 rounded text-xs ${
            mode === "default" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => onModeChange("default")}
        >
          Default
        </button>
        <button
          className={`px-2 py-1 rounded text-xs ${
            mode === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => onModeChange("user")}
        >
          User
        </button>
      </div>
    </div>
    <table className="table-auto border-collapse border border-gray-300 text-sm w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1 text-left w-[80%]">{title}</th>
          <th className="border px-2 py-1 w-[10%]">DEFAULT</th>
          <th className="border px-2 py-1 w-[10%]">USER</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={i}
            className="odd:bg-white even:bg-gray-50 hover:bg-gray-100"
          >
            <td className="border px-2 py-1">{r[0]}</td>
            <td className="border px-2 py-1 text-center">{r[1]}</td>
            <td className="border text-center">
              <input
                type="text"
                value={mode === "default" ? r[1] : r[2] ?? ""} // ใช้ default ถ้าเลือก Default
                disabled={mode === "default"}
                onChange={(e) => onChange?.(i, e.target.value)}
                className="w-full h-full px-2 border-gray-300 rounded text-xs focus:outline-none"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SettingV2 = () => {
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);
  const { token, getSummary } = useStore((state) => state);
  const [roomList, setRoomList] = useState([]);
  const [formConfig, setFormConfig] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState("");
  const uniqueFloors = [...new Set(roomList.map((room) => room.floor))];
  const [modeConfig, setModeConfig] = useState({});
  const defaultValues = {
    checkIn: [2, 22, 1, 3, 20, 1, 25], //  CHECK IN / GUEST IN
    checkOut: [0, 27], // CHECK OUT
    guestOut: [0, 27, 30, 2, 25, 10, 1, 27, 10], // GUEST OUT
    sleepMode: [0, 0, 2, 27, 5, 30], //  SLEEP MODE
  };

  const fetchRoomList = async () => {
    try {
      const response = await GetRooms(token);
      const mappedData = (response?.data || []).map((row) => ({
        ...row,
        devices: row.devices
          .filter((dev) => dev.type_id == device_type.CONFIG)
          .map((dev) => {
            const controlsById = dev.controls.reduce((acc, ctrl) => {
              acc[ctrl.control_id] = ctrl;
              return acc;
            }, {});

            const filteredControls = dev.controls
              .filter((ctrl) => ctrl.control_id < 100)
              .map((ctrl) => {
                let address = null;
                let fc = null;

                const refCtrl = controlsById[ctrl.control_id + 100];
                if (refCtrl) {
                  const value = parseInt(refCtrl.value);
                  if (!isNaN(value)) {
                    const modbus = CheckFunctionModbus(value);
                    address = modbus.address;
                    fc = modbus.funct;
                  }
                }

                return {
                  ...ctrl,
                  address,
                  fc,
                };
              });

            return {
              ...dev,
              controls: filteredControls,
            };
          }),
      }));

      setRoomList(mappedData);
      //   console.log(mappedData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoomList();
  }, [token]);

  const configField = (devices) => {
    if (!devices.length) return null;

    return (
      <>
        {devices.map((dev) => {
          // group controls by category
          const category_dateTime = dev.controls?.filter((c) =>
            [20, 21, 22, 23, 24, 25].includes(c.control_id)
          );
          const category_checkIn_GuestIn = dev.controls?.filter((c) =>
            [7, 8, 14, 15, 16, 17, 18].includes(c.control_id)
          );
          const category_checkOut = dev.controls?.filter((c) =>
            [9, 10].includes(c.control_id)
          );
          const category_guestOut = dev.controls?.filter((c) =>
            [11, 12, 13, 26, 27, 28, 29, 30, 31].includes(c.control_id)
          );

          const category_sleepMode = dev.controls?.filter((c) =>
            [1, 2, 3, 4, 5, 6].includes(c.control_id)
          );

          const toRows = (controls, device_id, category) =>
            controls.map((c, idx) => [
              c.name.split("-").pop().trim(),
              defaultValues[category]?.[idx] ?? "",
              formConfig[device_id]?.[category]?.[idx] ?? c.value,
            ]);

          return (
            <React.Fragment key={dev.device_id}>
              {/* date & time */}
              <div className="flex flex-col gap-2 col-span-1  p-0 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1 col-span-full">
                    <div className="grid grid-cols-1 gap-1 items-center">
                      <h6 className="text-left text-sm">
                        RCU:{" "}
                        <span className="font-semibold">
                          {category_dateTime[3]?.value}/
                          {category_dateTime[4]?.value}/
                          {category_dateTime[5]?.value}{" "}
                          {category_dateTime[0]?.value}:
                          {String(category_dateTime[1]?.value || "").padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </h6>
                    </div>
                    <label className="text-sm font-medium">Date & Time</label>
                    <input
                      type="datetime-local"
                      name="datetime-local"
                      value={formConfig[dev.device_id]?.datetime || ""}
                      onChange={(e) => {
                        const datetime = e.target.value;
                        setFormConfig((prev) => ({
                          ...prev,
                          [dev.device_id]: {
                            ...prev[dev.device_id],
                            datetime,
                          },
                        }));
                      }}
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ExcelTable
                  title="CHECK IN / GUEST IN"
                  rows={toRows(
                    category_checkIn_GuestIn,
                    dev.device_id,
                    "checkIn"
                  )}
                  mode={modeConfig[dev.device_id]?.checkIn || "user"}
                  onModeChange={(newMode) =>
                    setModeConfig((prev) => ({
                      ...prev,
                      [dev.device_id]: {
                        ...prev[dev.device_id],
                        checkIn: newMode,
                      },
                    }))
                  }
                  onChange={(i, newVal) => {
                    setFormConfig((prev) => ({
                      ...prev,
                      [dev.device_id]: {
                        ...prev[dev.device_id],
                        checkIn: {
                          ...(prev[dev.device_id]?.checkIn || {}),
                          [i]: newVal,
                        },
                      },
                    }));
                  }}
                />

                <ExcelTable
                  title="CHECK OUT"
                  rows={toRows(category_checkOut, dev.device_id, "checkOut")}
                  mode={modeConfig[dev.device_id]?.checkOut || "user"}
                  onModeChange={(newMode) =>
                    setModeConfig((prev) => ({
                      ...prev,
                      [dev.device_id]: {
                        ...prev[dev.device_id],
                        checkOut: newMode,
                      },
                    }))
                  }
                  onChange={(i, newVal) => {
                    setFormConfig((prev) => ({
                      ...prev,
                      [dev.device_id]: {
                        ...prev[dev.device_id],
                        checkOut: {
                          ...(prev[dev.device_id]?.checkOut || {}),
                          [i]: newVal,
                        },
                      },
                    }));
                  }}
                />

                <ExcelTable
                  title="CHECK GUEST OUT
"
                  rows={toRows(category_guestOut, dev.device_id, "guestOut")}
                  mode={modeConfig[dev.device_id]?.guestOut || "user"}
                  onModeChange={(newMode) =>
                    setModeConfig((prev) => ({
                      ...prev,
                      [dev.device_id]: {
                        ...prev[dev.device_id],
                        guestOut: newMode,
                      },
                    }))
                  }
                  onChange={(i, newVal) => {
                    setFormConfig((prev) => ({
                      ...prev,
                      [dev.device_id]: {
                        ...prev[dev.device_id],
                        guestOut: {
                          ...(prev[dev.device_id]?.guestOut || {}),
                          [i]: newVal,
                        },
                      },
                    }));
                  }}
                />

                <ExcelTable
                  title="SLEEP MODE"
                  rows={toRows(category_sleepMode, dev.device_id, "sleepMode")}
                  mode={modeConfig[dev.device_id]?.sleepMode || "user"}
                  onModeChange={(newMode) =>
                    setModeConfig((prev) => ({
                      ...prev,
                      [dev.device_id]: {
                        ...prev[dev.device_id],
                        sleepMode: newMode,
                      },
                    }))
                  }
                  onChange={(i, newVal) => {
                    setFormConfig((prev) => ({
                      ...prev,
                      [dev.device_id]: {
                        ...prev[dev.device_id],
                        sleepMode: {
                          ...(prev[dev.device_id]?.sleepMode || {}),
                          [i]: newVal,
                        },
                      },
                    }));
                  }}
                />
              </div>
            </React.Fragment>
          );
        })}
      </>
    );
  };

  const handleBulkSave = async () => {
    if (!selectedRooms.length) return;
    setIsSaving(true);

    try {
      for (const room of selectedRooms) {
        for (const dev of room.devices) {
          const config = formConfig[dev.device_id] || {};

          // 📌 DateTime
          if (config.datetime) {
            const date = new Date(config.datetime);
            const datetimeMap = {
              20: date.getHours(),
              21: date.getMinutes(),
              22: 0, // seconds
              23: date.getDate(),
              24: date.getMonth() + 1,
              25: date.getFullYear() % 100,
            };

            for (const [address, value] of Object.entries(datetimeMap)) {
              const payload = {
                cmd: client.WRITE_REGISTER,
                param: {
                  address: Number(address),
                  value,
                  slaveId: 1,
                  ip: room.ip_address,
                  fc: 6,
                },
              };
              console.log("Sent datetime payload:", payload);
              // ws.current.send(JSON.stringify(payload));
              await delay(50);
            }
          }

          // 📌 Controls (แบ่งตาม category)
          const categories = {
            sleepMode: [1, 2, 3, 4, 5, 6],
            checkIn: [7, 8, 14, 15, 16, 17, 18],
            checkOut: [9, 10],
            guestOut: [11, 12, 13, 26, 27, 28, 29, 30, 31],
          };

          for (const [category, controlIds] of Object.entries(categories)) {
            const controlsInCategory = dev.controls.filter((c) =>
              controlIds.includes(c.control_id)
            );

            const mode = modeConfig[dev.device_id]?.[category] || "user";

            controlsInCategory.forEach(async (ctrl, rowIdx) => {
              let valueToSend = null;

              if (mode === "default") {
                valueToSend = defaultValues[category]?.[rowIdx] ?? null;
              } else {
                valueToSend = config[category]?.[rowIdx] ?? null;
              }

              if (valueToSend !== null && valueToSend !== "") {
                const payload = {
                  cmd: client.WRITE_REGISTER,
                  param: {
                    address: ctrl.address,
                    value: Number(valueToSend),
                    slaveId: 1,
                    ip: room.ip_address,
                    fc: ctrl.fc === 30000 ? 6 : ctrl.fc === 10000 ? 5 : 0,
                  },
                };
                // console.log(
                //   `Sent payload category=${category} row=${rowIdx}`,
                //   payload
                // );
                sendWebSocketMessage(payload);
                await delay(50);
              }
            });
          }
        }
      }

      toast.success("All configs sent successfully!");
    } catch (err) {
      console.error("Send failed:", err);
      toast.error("Send failed!");
    } finally {
      setIsSaving(false);
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
      case client.LOGIN:
        if (param.status === "success") {
          console.log("Login success");
        }
        break;

      case client.MODBUS_STATUS: {
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

      case client.FORWARD_UPDATE: {
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

      case client.NEW_TASK:
        getSummary(token);
        break;

      case client.UPDATE_TASK:
        getSummary(token);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (selectedRooms) {
      const updatedRoom = roomList.find(
        (room) => room.room_id == selectedRooms.room_id
      );
      if (updatedRoom) {
        setSelectedRooms(updatedRoom);
      }
    }
  }, [roomList]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Sidebar */}
      <div className="lg:w-1/3 w-full bg-white rounded-lg shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold mb-2">Room List</h2>
          <div className="space-y-2">
            <select
              value={selectedFloor}
              onChange={(e) => {
                const floor = parseInt(e.target.value);
                setSelectedFloor(e.target.value);
                if (!isNaN(floor)) {
                  const roomsOnFloor = roomList.filter(
                    (room) => room.floor === floor
                  );
                  setSelectedRooms(roomsOnFloor);
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select floor</option>
              {uniqueFloors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>

            {/* Clear Button */}
            <button
              onClick={() => {
                setSelectedRooms([]);
                setSelectedFloor("");
              }}
              className="w-full px-3 py-1 bg-gray-400 text-white rounded-md text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {roomList.map((room) => (
            <div
              key={room.room_id}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-200`}
              onClick={() => {
                setSelectedRooms((prev) => {
                  const alreadySelected = prev.some(
                    (r) => r.room_id === room.room_id
                  );
                  if (alreadySelected) {
                    return prev.filter((r) => r.room_id !== room.room_id); // toggle off
                  } else {
                    return [...prev, room];
                  }
                });
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold">
                  Room {room?.room_number}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    Floor {room?.floor}
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  {selectedRooms.some((r) => r.room_id === room.room_id) && (
                    <Check className="h-6 w-4 text-green-600" />
                  )}
                  <Settings className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="mb-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.is_online == 1
                      ? "bg-green-100 text-green-800"
                      : room.is_online == 0
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {room.is_online == 1
                    ? "Online"
                    : room.is_online == 0
                    ? "Offline"
                    : "N/A"}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                IP: {room?.ip_address ? room?.ip_address : "N/A"} | MAC:{" "}
                {room?.mac_address ? room?.mac_address : "N/A"}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col">
        {selectedRooms.length > 0 ? (
          (() => {
            const firstRoomWithDevices = selectedRooms.find(
              (room) => room.devices && room.devices.length > 0
            );

            if (firstRoomWithDevices) {
              return (
                <>
                  <div className="px-4  border-b border-gray-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 h-12 max-h-16 overflow-auto">
                      <h2 className="text-xs font-semibold">
                        Config Room:{" "}
                        {selectedRooms
                          .map((room) => room.room_number)
                          .join(", ")}
                      </h2>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto p-4 space-y-2">
                    <div className="w-full flex items-center gap-4">
                      <label
                        htmlFor="type_room"
                        className="text-sm font-semibold"
                      >
                        Room type
                      </label>
                      <select
                        id="type_room"
                        className=" border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Single</option>
                        <option value="">2Bay</option>
                        <option value="">3Bay</option>
                        <option value="">4Bay</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {configField(firstRoomWithDevices.devices)}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
                    <button
                      onClick={
                        () => handleBulkSave()
                        // firstRoomWithDevices.ip_address,
                        // firstRoomWithDevices.devices[0].device_id
                      }
                      disabled={isSaving}
                      className={`px-4 py-2 rounded-md text-white font-semibold ${
                        isSaving
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary hover:bg-primary/80"
                      }`}
                    >
                      {isSaving ? (
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </>
              );
            } else {
              return (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-gray-500">
                  <Settings className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-lg font-medium">
                    This room has no config.
                  </p>
                  <p className="text-sm">Please select another room.</p>
                </div>
              );
            }
          })()
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-gray-500">
            <Settings className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-lg font-medium">Select a room to set up.</p>
            <p className="text-sm">
              Click on a room in the list to start setting up.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingV2;
