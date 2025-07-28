import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { GetRooms } from "@/api/room";
import useStore from "@/store/store";
import { device_type } from "@/constant/common";
import { CheckFunctionModbus } from "@/utilities/helpers";
import { toast } from "react-toastify";
import { client } from "@/constant/wsCommand";
import {
  Trash,
  Plus,
  Settings,
  Sun,
  Clock,
  Save,
  Copy,
  Check,
} from "lucide-react";

const Multiscreen = () => {
  const [scenes, setScenes] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    minKelvin: 2500,
    maxKelvin: 6500,
    maxDimLevel: 100,
    minTransition: 1,
  });
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

  const fetchRoomList = async () => {
    try {
      const response = await GetRooms(token);
      const mappedData = (response?.data || []).map((row) => ({
        ...row,
        devices: row.devices
          .filter((dev) => dev.type_id == device_type.CONFIG_SENCE)
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
      // console.log(mappedData);
      setRoomList(mappedData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoomList();
  }, []);

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

  const extractScenesFromRoom = (room) => {
    if (!room?.devices || room.devices.length === 0) {
      return []; // ไม่มี device หรือ devices ว่าง ให้ return scenes ว่างเลย
    }

    const device = room.devices[0];
    if (!device?.controls || device.controls.length === 0) {
      return []; // ไม่มี controls ก็ return scenes ว่าง
    }

    const scenes = [];

    for (let i = 0; i < 5; i++) {
      const base = i * 6;
      const hourCtrl = device.controls[base];
      const minCtrl = device.controls[base + 1];
      const enabledCtrl = device.controls[base + 4];
      const colorCtrl = device.controls[base + 5];
      const isEnabled = enabledCtrl?.value == 1;

      if (hourCtrl && minCtrl && colorCtrl) {
        scenes.push({
          id: i + 1,
          name: `Scene ${i + 1}`,
          time: `${String(hourCtrl.value).padStart(2, "0")}:${String(
            minCtrl.value
          ).padStart(2, "0")}`,
          color: colorCtrl.value || 3000,
          enabled: isEnabled,
          dim: 50,
          transition: 5,
        });
      }
    }
    return scenes;
  };

  const generateControlUpdates = (scenes) => {
    // สมมติ backend ต้องการ 5 scene เสมอ
    const totalScenes = 5;
    const result = [];

    for (let i = 0; i < totalScenes; i++) {
      const baseId = i * 6;
      // หา scene ที่มี id = i+1
      const scene = scenes[i];
      console.log(scene);
      if (scene) {
        // scene มีอยู่ ส่งข้อมูลจริง
        const [hour, minute] = scene.time.split(":").map(Number);
        result.push(
          // { control_id: baseId + 1, value: hour },
          // { control_id: baseId + 2, value: minute },
          { control_id: baseId + 5, value: 1 }
          // { control_id: baseId + 6, value: scene.color }
        );
      } else {
        // scene ไม่มีใน UI (ไม่ได้สร้างหรือถูกปิด) ส่ง enabled=0 เพื่อปิด scene
        result.push(
          // { control_id: baseId + 1, value: 0 },
          // { control_id: baseId + 2, value: 0 },
          { control_id: baseId + 5, value: 0 } // enabled = 0 ปิด scene
          // { control_id: baseId + 6, value: settings.minKelvin }  // หรือค่าที่เหมาะสม
        );
      }
    }
    return result;
  };

  const handleSave = async () => {
    const controlPayload = generateControlUpdates(scenes);
    try {
      console.log(controlPayload);
      toast.success("Scenes saved successfully!");
    } catch (err) {
      toast.error("Error saving scenes");
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = String(h).padStart(2, "0");
        const minute = String(m).padStart(2, "0");
        const time = `${hour}:${minute}`;
        options.push(
          <option key={time} value={time}>
            {time}
          </option>
        );
      }
    }
    return options;
  };

  const generateDimOptions = () => {
    const options = [];
    for (let i = 0; i <= settings.maxDimLevel; i += 10) {
      options.push(
        <option key={i} value={i}>
          {i}%
        </option>
      );
    }
    return options;
  };

  const generateTransitionOptions = () => {
    const options = [];
    for (let m = settings.minTransition; m <= 60; m++) {
      options.push(
        <option key={m} value={m}>
          {m}min
        </option>
      );
    }
    return options;
  };

  const handleCreateEvent = () => {
    if (scenes.length === 5) {
      return toast.error("Do not create more than 5 scene");
    }

    let nextTime = "07:00";

    if (scenes.length > 0) {
      const lastTime = scenes[scenes.length - 1].time;
      const [hour, minute] = lastTime.split(":").map(Number);
      let totalMinutes = hour * 60 + minute + 30;

      if (totalMinutes >= 24 * 60) {
        totalMinutes = totalMinutes % (24 * 60);
      }

      const nextHour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const nextMinute = String(totalMinutes % 60).padStart(2, "0");
      nextTime = `${nextHour}:${nextMinute}`;
    }

    const newScene = {
      id: scenes.length + 1,
      name: `Scene ${scenes.length + 1}`,
      time: nextTime,
      color: Math.floor((settings.minKelvin + settings.maxKelvin) / 2),
      dim: 50,
      transition: 5,
    };

    setScenes((prev) => [...prev, newScene]);
  };

  const handleDeleteScene = (id) => {
    setScenes((prev) => prev.filter((scene) => scene.id !== id));
  };

  const updateScene = (id, field, value) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === id ? { ...scene, [field]: value } : scene
      )
    );
  };

  const updateSettings = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-2 h-full">
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
                  ชั้น {floor}
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
                  let newSelectedRooms;
                  if (alreadySelected) {
                    // ถ้าเป็น toggle off ให้ลบห้องนั้นออก
                    newSelectedRooms = prev.filter(
                      (r) => r.room_id !== room.room_id
                    );
                  } else {
                    // toggle on เพิ่มห้อง
                    newSelectedRooms = [...prev, room];
                  }

                  // สมมติแสดง scene เฉพาะห้องแรกใน selectedRooms (ถ้าเลือกหลายห้อง)
                  if (newSelectedRooms.length > 0) {
                    const firstRoom = newSelectedRooms[0];
                    // console.log(firstRoom)
                    const extractedScenes = extractScenesFromRoom(firstRoom);
                    setScenes(
                      extractScenesFromRoom(room).filter(
                        (scene) => scene.enabled
                      )
                    );
                  } else {
                    setScenes([]);
                  }

                  return newSelectedRooms;
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

      <div className="flex-1 flex flex-col gap-4 ">
        {!selectedRooms || selectedRooms.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-gray-500">
            <Settings className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-lg font-medium">Select a room to set up.</p>
            <p className="text-sm">
              Click on a room in the list to start setting up.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full h-12 max-h-16 overflow-auto">
              <h2 className="text-xs font-semibold">
                Config Room:{" "}
                {selectedRooms.map((room) => room.room_number).join(", ")}
              </h2>
            </div>
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCreateEvent}
                  className="flex items-center gap-2 bg-blue-500 text-white  text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add New Scene
                </button>

                {scenes.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{scenes.length}</span>
                    scene{scenes.length !== 1 ? "s" : ""}
                    {scenes.length == 48 && (
                      <span className="font-medium text-red-600">
                        (Maximum {scenes.length} scenes)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg  text-xs transition-all duration-200 ${
                    showSettings
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>

                <button
                  onClick={() => handleSave()}
                  className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Global Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Min Kelvin
                    </label>
                    <input
                      type="number"
                      min="1000"
                      max="10000"
                      step={100}
                      value={settings.minKelvin}
                      onChange={(e) =>
                        updateSettings("minKelvin", Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Max Kelvin
                    </label>
                    <input
                      type="number"
                      min="1000"
                      max="10000"
                      value={settings.maxKelvin}
                      step={100}
                      onChange={(e) =>
                        updateSettings("maxKelvin", Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Max Dim %
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={settings.maxDimLevel}
                      step={10}
                      onChange={(e) =>
                        updateSettings("maxDimLevel", Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Min Transition
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="59"
                      value={settings.minTransition}
                      onChange={(e) =>
                        updateSettings("minTransition", Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Scenes List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
              {scenes.length >= 1 ? (
                <div className="divide-y divide-gray-200">
                  {scenes.map((scene, index) => (
                    <div
                      key={scene.id}
                      className="p-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={scene.name}
                            onChange={(e) =>
                              updateScene(scene.id, "name", e.target.value)
                            }
                            className=" font-semibold bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1 transition-colors"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteScene(scene.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Time */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Schedule Time
                          </label>
                          <select
                            value={scene.time}
                            onChange={(e) =>
                              updateScene(scene.id, "time", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {generateTimeOptions()}
                          </select>
                        </div>

                        {/* Color Temperature */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Color Temperature
                          </label>
                          <div>
                            <input
                              type="range"
                              min={settings.minKelvin}
                              max={settings.maxKelvin}
                              step={100}
                              value={scene.color}
                              onChange={(e) =>
                                updateScene(
                                  scene.id,
                                  "color",
                                  Number(e.target.value)
                                )
                              }
                              className="range-basic w-full h-10 rounded-sm appearance-none bg-gray-300 transition-all duration-300 focus:outline-none"
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                Warm
                              </span>
                              <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                                {scene.color}K
                              </span>
                              <span className="text-xs text-gray-500">
                                Cool
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Brightness
                            </label>
                            <select
                              value={scene.dim}
                              onChange={(e) =>
                                updateScene(
                                  scene.id,
                                  "dim",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {generateDimOptions()}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Transition
                            </label>
                            <select
                              value={scene.transition}
                              onChange={(e) =>
                                updateScene(
                                  scene.id,
                                  "transition",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {generateTransitionOptions()}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sun className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No scenes yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first lighting scene to get started
                  </p>
                  <button
                    onClick={handleCreateEvent}
                    className="inline-flex items-center gap-2 bg-blue-500  px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Scene
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Multiscreen;
