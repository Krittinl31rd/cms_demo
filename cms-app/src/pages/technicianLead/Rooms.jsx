import React, { useEffect, useState, useRef } from "react";
import DataTable from "@/components/table/DataTable";
import CardSummary from "@/components/ui/CardSummary";
import CardRoom from "@/components/ui/CardRoom";
import ModalPopup from "@/components/ui/ModalPopup";
import ElementDevices from "@/components/ui/ElementDevices";
import { Wifi, WifiOff, Globe, ListFilter, Check } from "lucide-react";
import { data } from "@/constant/data";
import { GetRooms } from "@/api/room";
import useStore from "@/store/store";
import { client } from "@/constant/wsCommand";
const stats = data.stats;

const Rooms = () => {
  console.log(client);
  const { token } = useStore((state) => state);
  const [roomList, setRoomList] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState([]);
  const [isModalFilterOpen, setIsModalFilterOpen] = useState(false);
  const filterLabels = {
    status_online: "Online",
    status_offline: "Offline",
    check_1: "Check-IN",
    check_0: "Check-OUT",
    gi_1: "Guest In",
    gi_0: "Guest Out",
    dnd_1: "DND",
    mur_1: "MUR",
    noservice: "No Service",
  };
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalRoomOpen, setIsModalRoomOpen] = useState(false);

  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);

  const fetchRoomList = async () => {
    try {
      const response = await GetRooms(token);
      setRoomList(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoomList();
  }, []);

  const toggleFilter = (filterKey) => {
    setFilters((prev) => {
      let updated = prev.includes(filterKey)
        ? prev.filter((f) => f !== filterKey)
        : [...prev, filterKey];

      const mutuallyExclusive = {
        status_1: "status_0",
        status_0: "status_1",
        check_1: "check_0",
        check_0: "check_1",
        gi_1: "gi_0",
        gi_0: "gi_1",
        dnd_1: ["mur_1", "noservice"],
        mur_1: ["dnd_1", "noservice"],
        noservice: ["dnd_1", "mur_1"],
      };

      const conflicts = mutuallyExclusive[filterKey];
      if (conflicts) {
        const conflictArray = Array.isArray(conflicts)
          ? conflicts
          : [conflicts];
        updated = updated.filter((f) => !conflictArray.includes(f));
      }

      return updated;
    });
  };

  const filteredRooms = roomList.filter((room) => {
    const matchesSearch = room.room_number
      .toLowerCase()
      .includes(search.toLowerCase());

    if (filters.length == 0) return matchesSearch;

    const matchAll = filters.every((filterKey) => {
      if (filterKey == "noservice") {
        return room.dnd_status == 0 && room.mur_status == 0;
      }

      const [key, rawValue] = filterKey.split("_");
      const value = isNaN(rawValue) ? rawValue : Number(rawValue);

      if (key == "status") return room.is_online == value;
      if (key == "check") return room.room_check_status == value;
      if (key == "gi") return room.guest_status_id == value;
      if (key == "dnd") return room.dnd_status == value;
      if (key == "mur") return room.mur_status == value;

      return false;
    });

    return matchesSearch && matchAll;
  });

  const activeFilterLabels = filters
    .map((key) => filterLabels[key])
    .filter(Boolean);

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

      case client.ROOM_STATUS_UPDATE: {
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

      default:
        break;
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      const updatedRoom = roomList.find(
        (room) => room.room_id == selectedRoom.room_id
      );
      if (updatedRoom) {
        setSelectedRoom(updatedRoom);
      }
    }
  }, [roomList]);

  return (
    <div className="flex flex-col gap-2">
      <div className="hidden sm:grid md:grid-cols-2 lg:grid-cols-4 gap-2">
        <CardSummary
          title="Online"
          value={stats.onlineRooms}
          icon={Globe}
          iconColor="text-green-500"
        />
        <CardSummary
          title="Offline"
          value={stats.offlineRooms}
          icon={Globe}
          iconColor="text-red-500"
        />
      </div>

      <div className="w-full flex items-center justify-between gap-2 bg-white rounded-xl shadow-xl p-4">
        <input
          type="text"
          placeholder="Search by room number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setIsModalFilterOpen(true)}
          className="flex items-center gap-1  text-primary cursor-pointer rounded-lg p-1 hover:bg-gray-100"
        >
          Filter <ListFilter size={16} />
        </button>
      </div>
      <h1 className="text-sm">
        Filter by:{" "}
        <span className="font-semibold">
          {activeFilterLabels.length > 0
            ? activeFilterLabels.join(", ")
            : "None"}
        </span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => (
            <CardRoom
              onClick={() => {
                setSelectedRoom(room);
                setIsModalRoomOpen(true);
              }}
              key={index}
              room={room}
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No rooms found.
          </p>
        )}
      </div>

      <ModalPopup
        isOpen={isModalFilterOpen}
        onClose={() => setIsModalFilterOpen(false)}
        title={`Filter`}
      >
        <div className="space-y-2 text-sm">
          <button
            className="absolute top-12 right-6 text-primary font-semibold hover:underline cursor-pointer"
            onClick={() => {
              setSearch("");
              setFilters([]);
            }}
          >
            Reset
          </button>
          <h1 className=" font-semibold">General</h1>
          <div className="w-full flex items-center flex-wrap gap-2 pb-2 border-b border-gray-300">
            {[
              { key: "status", value: 1, label: "Online" },
              { key: "status", value: 0, label: "Offline" },
              { key: "check", value: 1, label: "Check-IN" },
              { key: "check", value: 0, label: "Check-OUT" },
              { key: "gi", value: 1, label: "Guest In" },
              { key: "gi", value: 0, label: "Guest Out" },
            ].map(({ key, value, label }) => {
              const filterKey = `${key}_${value}`;
              return (
                <label
                  key={filterKey}
                  className="relative flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    // checked={!!filters[filterKey]}
                    checked={filters.includes(filterKey)}
                    className="peer hidden"
                    onChange={() => toggleFilter(filterKey)}
                  />

                  <div
                    className="flex items-center gap-1 border border-gray-400 px-2 py-1 rounded-full 
                  peer-checked:bg-blue-100 peer-checked:border-blue-100 peer-checked:text-blue-500 peer-checked:pl-7"
                  >
                    <span className="font-semibold">{label}</span>
                  </div>
                  <Check className="absolute top-2 left-2 w-4 h-4 text-blue-500 hidden peer-checked:block" />
                </label>
              );
            })}
          </div>
          <h1 className=" font-semibold">Room Service</h1>
          <div className="w-full flex items-center flex-wrap gap-2 pb-2 border-b border-gray-300">
            {[
              { key: "dnd", value: 1, label: "DND" },
              { key: "mur", value: 1, label: "MUR" },
              { key: "noservice", label: "No Service" },
            ].map(({ key, value, label }) => {
              const filterKey = value != undefined ? `${key}_${value}` : key;
              return (
                <label
                  key={filterKey}
                  className="relative flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    // checked={!!filters[filterKey]}
                    checked={filters.includes(filterKey)}
                    className="peer hidden"
                    onChange={() => toggleFilter(filterKey)}
                  />

                  <div
                    className="flex items-center gap-1 border border-gray-400 px-2 py-1 rounded-full 
                  peer-checked:bg-blue-100 peer-checked:border-blue-100 peer-checked:text-blue-500 peer-checked:pl-7"
                  >
                    <span className="font-semibold">{label}</span>
                  </div>
                  <Check className="absolute top-2 left-2 w-4 h-4 text-blue-500 hidden peer-checked:block" />
                </label>
              );
            })}
          </div>
        </div>
      </ModalPopup>
      <ModalPopup
        isOpen={isModalRoomOpen}
        onClose={() => setIsModalRoomOpen(false)}
        title={`Room ${selectedRoom?.room_number}`}
      >
        <ElementDevices
          room={selectedRoom || {}}
          sendWebSocketMessage={sendWebSocketMessage}
        />
      </ModalPopup>
    </div>
  );
};

export default Rooms;
