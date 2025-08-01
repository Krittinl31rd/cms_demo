import React, { useEffect, useState, useRef, useMemo } from "react";
import CardRoom from "@/components/ui/CardRoom";
import ModalPopup from "@/components/ui/ModalPopup";
import ElementDevices from "@/components/ui/ElementDevices";
import { GetRooms } from "@/api/room";
import useStore from "@/store/store";
import { client } from "@/constant/wsCommand";
import Spinner from "@/components/ui/Spinner";

const AllRcus = () => {
  const { token, getSummary } = useStore((state) => state);
  const [loading, setLoading] = useState(true);
  const [roomList, setRoomList] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalRoomOpen, setIsModalRoomOpen] = useState(false);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);
  const [filterFloor, setFilterFloor] = useState("all");
  const [filterOnline, setFilterOnline] = useState("all");

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
  }, []);

  const filteredRooms = useMemo(() => {
    return roomList.filter((room) => {
      const matchFloor =
        filterFloor === "all" || room.floor?.toString() === filterFloor;
      const matchOnline =
        filterOnline === "all" || room.is_online?.toString() === filterOnline;
      return matchFloor && matchOnline;
    });
  }, [roomList, filterFloor, filterOnline]);

  const groupedRoomsByFloor = useMemo(() => {
    const grouped = {};

    filteredRooms.forEach((room) => {
      const floor = room.floor ?? "Unknown";
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(room);
    });

    return Object.entries(grouped)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .reduce((obj, [floor, rooms]) => {
        obj[floor] = rooms;
        return obj;
      }, {});
  }, [filteredRooms]);

  const uniqueFloors = useMemo(() => {
    const floors = [...new Set(roomList.map((room) => room.floor))];
    return floors
      .filter((f) => f !== null && f !== undefined)
      .sort((a, b) => a - b);
  }, [roomList]);

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
        console.log(param);
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
        getSummary(token);
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
                  ...(roomStatus.request_status != undefined && {
                    request_status: roomStatus.request_status,
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
        getSummary(token);
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
    <>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <button
          onClick={() => setFilterOnline("all")}
          className={`h-8 px-4 rounded-2xl font-bold text-white ${
            filterOnline === "all" ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterOnline("1")}
          className={`h-8 px-4 rounded-2xl font-bold text-white ${
            filterOnline === "1" ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          Online
        </button>
        <button
          onClick={() => setFilterOnline("0")}
          className={`h-8 px-4 rounded-2xl font-bold text-white ${
            filterOnline === "0" ? "bg-red-500" : "bg-gray-300"
          }`}
        >
          Offline
        </button>
      </div>
      <div className="flex justify-end items-center mb-2">
        {/* Filter by Floor */}
        <div className="flex gap-2 items-center">
          <label className="text-sm">Floor:</label>
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className=" border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {uniqueFloors.map((floor) => (
              <option key={floor} value={floor}>
                Floor {floor}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Spinner />
          Loading rooms....
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {Object.entries(groupedRoomsByFloor).map(([floor, rooms]) => (
            <div key={floor} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Floor {floor}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                {rooms.map((room) => (
                  <CardRoom
                    key={room.room_id}
                    room={room}
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsModalRoomOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
    </>
  );
};

export default AllRcus;
