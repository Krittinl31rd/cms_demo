import React from "react";
import {
  guest_check_status,
  guest_presence_status,
  device_status,
} from "@/constant/common.js";

const statusColor = {
  1: "bg-green-500",
  0: "bg-gray-400",
};

const CardRoom = ({ room, onClick }) => {
  const {
    dnd_status,
    floor,
    guest_check_id,
    guest_status_id,
    mur_status,
    room_number,
    is_online,
  } = room;

  const deviceIndicator = (label, state) => (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${
          statusColor[state] || "bg-yellow-400"
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
        <div className="-space-y-2">
          <h2 className="text-xl font-semibold">{room_number}</h2>
          <span className="text-xs">
            Floor <strong>{floor}</strong>
          </span>
        </div>

        <span
          className={`px-2 py-1 text-sm rounded-full ${
            is_online == device_status.OK
              ? "bg-green-200 text-green-800"
              : // : is_online == device_status.FAULT
              // ? "bg-yellow-200 text-yellow-800"
              is_online == device_status.OFFLINE
              ? "bg-red-200 text-red-800"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {is_online == device_status.OK
            ? "Online"
            : // : is_online == device_status.FAULT
            // ? "Fault"
            is_online == device_status.OFFLINE
            ? "Offline"
            : "N/A"}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2">
        {deviceIndicator(
          guest_check_id == guest_check_status.CHECK_IN
            ? "Check-IN"
            : guest_check_id == guest_check_status.CHECK_OUT
            ? "Check-OUT"
            : "N/A",
          guest_check_id
        )}
        {deviceIndicator(
          guest_status_id == 0
            ? "Guests-OUT"
            : guest_status_id == 1 || guest_status_id == 2
            ? "Guests-IN"
            : "N/A",
          guest_status_id
        )}
        {deviceIndicator(
          dnd_status == 0 ? "DND" : dnd_status == 1 ? "DND" : "N/A",
          dnd_status
        )}
        {deviceIndicator(
          mur_status == 0 ? "MUR" : mur_status == 1 ? "MUR" : "N/A",
          mur_status
        )}
      </div>
    </div>
  );
};

export default CardRoom;
