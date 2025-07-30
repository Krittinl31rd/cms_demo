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

const Setting = () => {
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);
  const { token } = useStore((state) => state);
  const [roomList, setRoomList] = useState([]);
  const [formConfig, setFormConfig] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState("");
  const uniqueFloors = [...new Set(roomList.map((room) => room.floor))];
  const navigate = useNavigate();

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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoomList();
  }, []);

  const handleFormConfig = (e, dev, ctrl, timeType = null) => {
    const raw = e.target.value;
    const value = raw.replace(/\D/g, "");
    const num = parseInt(value);
    if (isNaN(num)) return;

    const key =
      timeType !== null ? `${ctrl.control_id}_${timeType}` : ctrl.control_id;

    setFormConfig((prev) => ({
      ...prev,
      [dev.device_id]: {
        ...prev[dev.device_id],
        [key]: num,
      },
    }));
  };

  const handleSave = async (room, deviceId) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // setTimeout(() => {
      //   setIsSaving(false);
      // }, 20000);

      const configField = formConfig[deviceId] || {};
      const device = room.devices.find((d) => d.device_id == deviceId);
      if (!device) return;

      // extract datetime if present
      const datetime = configField.datetime;
      let datetimeMap = {};
      if (datetime) {
        const date = new Date(datetime);
        datetimeMap = {
          20: date.getHours(),
          21: date.getMinutes(),
          22: 0,
          23: date.getDate(),
          24: date.getMonth() + 1,
          25: date.getFullYear() % 100,
        };
      }

      for (const {
        fc,
        address,
        control_id,
        value: defaultValue,
      } of device.controls) {
        let value;

        if ([13, 14, 28, 31].includes(control_id)) {
          const hasHour = configField.hasOwnProperty(`${control_id}_Hour`);
          const hasMin = configField.hasOwnProperty(`${control_id}_Min`);
          const hasSec = configField.hasOwnProperty(`${control_id}_Sec`);

          if (!hasHour && !hasMin && !hasSec) continue;

          const hour = hasHour
            ? configField[`${control_id}_Hour`]
            : Math.floor(defaultValue / 3600);
          const min = hasMin
            ? configField[`${control_id}_Min`]
            : Math.floor((defaultValue % 3600) / 60);
          const sec = hasSec
            ? configField[`${control_id}_Sec`]
            : defaultValue % 60;

          value = hour * 3600 + min * 60 + sec;
        } else if ([20, 21, 22, 23, 24, 25].includes(control_id)) {
          value = datetimeMap[control_id];
        } else {
          let rawValue = configField[control_id];
          if (rawValue === "" || rawValue === null || rawValue === undefined) {
            rawValue = defaultValue;
          }

          value = parseInt(rawValue);
          if (isNaN(value)) continue;
        }

        if (value === undefined || value === null || isNaN(value)) continue;

        if (address == 49) {
          value = 1;
        }

        const payload = {
          cmd: client.WRITE_REGISTER,
          param: {
            address,
            value,
            slaveId: 1,
            ip: room.ip_address,
            fc: fc === 30000 ? 6 : fc === 10000 ? 5 : 0,
          },
        };
        console.log(payload);
        sendWebSocketMessage(payload);
        await delay(50);
      }
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setTimeout(() => setIsSaving(false), 20000);
    }
  };

  const handleBulkSave = async () => {
    if (isSaving || selectedRooms.length === 0) return;
    try {
      for (const room of selectedRooms) {
        for (const device of room.devices) {
          await handleSave(room, device.device_id);
        }
      }
      toast.success("Saved settings for selected rooms.");
    } catch (err) {
      toast.error("Error saving settings for some rooms.");
      console.error(err);
    }
  };

  const configField = (devices) => {
    if (!devices.length) return null;

    return (
      <>
        {devices.map((dev) => {
          const category_dateTime = dev.controls?.filter((c) =>
            [20, 21, 22, 23, 24, 25].includes(c.control_id)
          );

          const category_nightShift = dev.controls?.filter((c) =>
            [3, 1, 2, 4, 5, 6].includes(c.control_id)
          );

          const category_ESM = dev.controls?.filter((c) =>
            [
              7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 26, 27, 28, 29, 30,
              31,
            ].includes(c.control_id)
          );

          return (
            <React.Fragment key={dev.device_id}>
              {/* date & time */}
              <div className="flex flex-col gap-2 col-span-1  p-0 ">
                <h3 className="py-1 rounded-md text-white bg-primary font-semibold text-center uppercase">
                  Date & Time
                </h3>
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
              {/* night mode */}
              <div className="flex flex-col gap-2 col-span-1  p-0 ">
                <h3 className="py-1 rounded-md text-white bg-primary font-semibold text-center uppercase">
                  Night shift mode
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {category_nightShift.map((control) => {
                    const label = control.name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase());
                    let inputElement;
                    inputElement = (
                      <input
                        type="text"
                        value={
                          formConfig[dev.device_id]?.[control.control_id] ??
                          control?.value
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => handleFormConfig(e, dev, control)}
                      />
                    );
                    return (
                      <div
                        key={control.control_id}
                        className="flex flex-col gap-1"
                      >
                        <label className="text-sm font-medium">{label}</label>
                        {inputElement}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-2 col-span-1  p-0 ">
                <h3 className="py-1 rounded-md text-white bg-primary font-semibold text-center uppercase">
                  esm mode
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category_ESM.map((control) => {
                    const label = control.name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase());
                    let inputElement;

                    if ([13, 14, 28, 31].includes(control.control_id)) {
                      const totalSeconds = parseInt(control?.value) || 0;
                      const initialHours = Math.floor(totalSeconds / 3600);
                      const initialMinutes = Math.floor(
                        (totalSeconds % 3600) / 60
                      );
                      const initialSeconds = totalSeconds % 60;

                      inputElement = (
                        <div className="grid grid-cols-3 items-center h-full gap-1">
                          <div className="flex items-center gap-1 text-xs h-full">
                            <label htmlFor="Hour">Hour</label>
                            <input
                              id="Hour"
                              type="number"
                              min={0}
                              max={23}
                              value={
                                formConfig[dev.device_id]?.[
                                  `${control.control_id}_Hour`
                                ] ?? initialHours
                              }
                              onChange={(e) =>
                                handleFormConfig(e, dev, control, "Hour")
                              }
                              className="w-full  border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-1 text-xs h-full">
                            <label htmlFor="Min">Min</label>
                            <input
                              id="Min"
                              type="number"
                              min={0}
                              max={59}
                              value={
                                formConfig[dev.device_id]?.[
                                  `${control.control_id}_Min`
                                ] ?? initialMinutes
                              }
                              onChange={(e) =>
                                handleFormConfig(e, dev, control, "Min")
                              }
                              className="w-full  border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-1 text-xs h-full">
                            <label htmlFor="Sec">Sec</label>
                            <input
                              id="Sec"
                              type="number"
                              min={0}
                              max={59}
                              value={
                                formConfig[dev.device_id]?.[
                                  `${control.control_id}_Sec`
                                ] ?? initialSeconds
                              }
                              onChange={(e) =>
                                handleFormConfig(e, dev, control, "Sec")
                              }
                              className="w-full  border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      );
                    } else {
                      inputElement = (
                        <input
                          type="text"
                          value={
                            formConfig[dev.device_id]?.[control.control_id] ??
                            control?.value
                          }
                          className="w-full  border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => handleFormConfig(e, dev, control)}
                        />
                      );
                    }

                    return (
                      <div
                        key={control.control_id}
                        className="flex flex-col gap-1"
                      >
                        <label className="text-sm font-medium">{label}</label>
                        {inputElement}
                      </div>
                    );
                  })}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </>
    );
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

        // const isSave = param.data.find(
        //   (item) => item.type_id == device_type.CONFIG && item.control_id == 19
        // );
        // console.log(param.data);
        // if (isSave !== undefined) {
        //   if (isSave.value == 2) {
        //     toast.success(`Save config for ${param.ip} Successfully :)`);
        //   } else if (isSave.value == 3) {
        //     toast.error(`Save config for ${param.ip} Failed :(`);
        //   } else {
        //     return;
        //   }
        // }

        break;
      }

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
        <button
          onClick={() => {
            navigate("/techlead/main");
          }}
          className="flex mb-0 px-4 py-2 text-black rounded "
        >
          <ArrowLeft /> Back
        </button>
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
            {/* <input
              type="text"
              placeholder="Search room..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="" disabled>
                Status
              </option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select> */}
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
                  <div className="p-4 border-b border-gray-300">
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

export default Setting;
