import React from "react";

const statusColor = {
  1: "bg-green-500",
  0: "bg-gray-400",
};

const CardRoom = ({ room, onClick }) => {
  const { name, status, devices } = room;

  const deviceIndicator = (label, state) => (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${
          statusColor[state] || "bg-gray-400"
        }`}
      ></span>
      <span className="text-xs xl:text-sm">{label}</span>
    </div>
  );

  return (
    <div
      onClick={onClick}
      className="flex flex-col bg-white rounded-lg shadow-md p-4 gap-4 cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{name}</h2>
        <span
          className={`px-2 py-1 text-sm rounded-full ${
            status === "online"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {status === "online" ? "Online" : "Offline"}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2">
        {deviceIndicator(
          devices.check == 1 ? "Check-IN" : "Check-OUT",
          devices.check
        )}
        {deviceIndicator(
          devices.gi == 1 ? "Guests-IN" : "Guests-OUT",
          devices.gi
        )}
        {deviceIndicator("DND", devices.dnd)}
        {deviceIndicator("MUR", devices.mur)}
      </div>
    </div>
  );
};

export default CardRoom;
