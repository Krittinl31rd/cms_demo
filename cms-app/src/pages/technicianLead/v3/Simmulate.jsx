import React, { useState, useRef, useEffect } from "react";
import useStore from "@/store/store";
import { GetRooms } from "@/api/room";

const Simmulate = () => {
  const [selectedRange, setSelectedRange] = useState([1, 20]);
  const { token } = useStore();
  const [loading, setLoading] = useState(true);
  const [roomList, setRoomList] = useState([]);
  const ws = useRef(null);

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

  // group room by floor
  const roomsByFloor = roomList.reduce((acc, room) => {
    const floor = room.floor || "Unknown";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const roomNumbers = Array.from(
    { length: selectedRange[1] - selectedRange[0] + 1 },
    (_, i) => i + selectedRange[0]
  );

  const roomStatus = [
    {
      status: "OC",
      lable: "OCCUPIED",
      bg: "bg-green-400",
      text: "text-black",
    },
    {
      status: "C-OUT",
      lable: "UNOCCUPIED DIRTY",
      bg: "bg-amber-100",
      text: "text-black",
    },
    {
      status: "IN",
      lable: "GUEST IN",
      bg: "bg-pink-300",
      text: "text-black",
    },
    {
      status: "DND",
      lable: "DO NOT DISTRUB",
      bg: "bg-red-500",
      text: "text-white",
    },
    {
      status: "TECH",
      lable: "TECH IN",
      bg: "bg-white",
      text: "text-black",
    },
    {
      status: "C-IN",
      lable: "CHECK IN",
      bg: "bg-white",
      text: "text-black",
    },
    {
      status: "DIRTY",
      lable: "OCCUPIED DIRTY",
      bg: "bg-green-200",
      text: "text-red-500",
    },
    {
      status: "DIRTY",
      lable: "UNOCCUPIED",
      bg: "bg-amber-200/80",
      text: "text-red-500",
    },
    {
      status: "OUT",
      lable: "GUEST OUT",
      bg: "bg-gray-300",
      text: "text-black",
    },
    {
      status: "MUR",
      lable: "MAKE UP ROOM",
      bg: "bg-orange-300",
      text: "text-black",
    },
    {
      status: "OL",
      lable: "OFFLINE",
      bg: "bg-black",
      text: "text-white",
    },
    {
      status: "BLOCK",
      lable: "RESERVED",
      bg: "bg-blue-600",
      text: "text-white",
    },
    {
      status: "CLEAN",
      lable: "OCCUPIED CLEAN",
      bg: "bg-green-100",
      text: "text-blue-500",
    },
    {
      status: "CLEAN",
      lable: "UNOCCUPIED CLEAN",
      bg: "bg-gray-50",
      text: "text-blue-500",
    },
    {
      status: "WIP",
      lable: "MAID IN",
      bg: "bg-sky-400",
      text: "text-white",
    },
    {
      status: "NC",
      lable: "NOT CLEANED",
      bg: "bg-yellow-300",
      text: "text-black",
    },
    {
      status: "CLEAN",
      lable: "ROOM CLEANED",
      bg: "bg-green-100",
      text: "text-blue-500",
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col gap-4 p-4">
      {/* <p className="text-xl bg-blue-600 text-white font-bold text-center border-2 border-black">
        100 ROOMS CMS/GRMS SIMULATION
      </p> */}
      <div className="flex-1 h-full space-y-4 overflow-auto pr-1">
        {Object.entries(roomsByFloor).map(([floor, rooms]) => (
          <div key={floor} className="space-y-0">
            {/* Header row (room numbers) */}
            <div className="grid grid-cols-21">
              <div className="col-span-1"></div>
              {roomNumbers.map((num) => (
                <div
                  key={num}
                  className={`text-center font-bold border-2 border-b-0 ${
                    num > 1 && "border-l-0"
                  } `}
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Floor row */}
            <div className="grid grid-cols-21">
              <div className="flex items-center justify-center col-span-1 font-semibold border-2 border-r-0">
                {floor}
              </div>
              {roomNumbers.map((num) => {
                const room = rooms.find((r) => r.room_id == num);
                console.log(room);
                return (
                  <div
                    key={num}
                    className={`p-1 text-center border-2 ${
                      num > 1 && "border-l-0"
                    }   ${room ? "bg-green-200" : "bg-gray-100"}`}
                  >
                    {room ? room.status || "✓" : "-"}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <h1 className="font-semibold">FLOOR ROOM STATUS</h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-center gap-2">
          {roomStatus.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 text-[12px] font-bold"
            >
              <div
                className={`flex items-center justify-center w-12 border-black border-2 ${item.bg} ${item.text}`}
              >
                {item.status}
              </div>
              <span>{item.lable}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <h1 className="font-semibold">
          STATUS SUMMARIES
          <div className="grid grid-cols-12 items-center gap-2 text-[12px]">
            <div className="flex flex-col items-center border-2 border-black w-14">
              <div className="w-full text-center border-b-2 border-black bg-amber-200">
                DIRTY
              </div>
              <div className="flex-1 flex items-center justify-center">
                0000
              </div>
            </div>
          </div>
        </h1>
      </div>
    </div>
  );
};

export default Simmulate;
