import React from "react";
import {
  guest_check_status,
  guest_presence_status,
  device_status,
  rooms_request_status,
  guestCheckStatusColor,
  guestPresenceStatusColor,
  roomsRequestStatusColor,
  statusColor,
} from "@/constant/common.js";

const CardRoom = ({ room, onClick }) => {
  const {
    request_status,
    floor,
    room_check_status,
    guest_status_id,
    room_number,
    is_online,
  } = room;

  const colorIs = (state, type) => {
    switch (type) {
      case "room_check_status":
        return guestCheckStatusColor[state];
      case "guest_status_id":
        return guestPresenceStatusColor[state];
      case "request_status":
        return roomsRequestStatusColor[state];
      default:
        return statusColor[state];
    }
  };

  const deviceIndicator = (label, state, type) => (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${colorIs(state, type) || "bg-black"}`}
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
          {/* <span className="text-xs">
            Floor <strong>{floor}</strong>
          </span> */}
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
            ? "ONLINE"
            : // : is_online == device_status.FAULT
            // ? "Fault"
            is_online == device_status.OFFLINE
            ? "OFFLINE"
            : "N/A"}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2">
        {deviceIndicator(
          room_check_status == guest_check_status.CHECK_IN
            ? "CHECK-IN"
            : room_check_status == guest_check_status.CHECK_OUT
            ? "CHECK-OUT"
            : room_check_status == guest_check_status.OCCUPIED
            ? "OCCUPIED"
            : room_check_status == guest_check_status.VACANT
            ? "VACANT"
            : "N/A",
          room_check_status,
          "room_check_status"
        )}
        {deviceIndicator(
          guest_status_id == guest_presence_status.GUEST_OUT
            ? "GUEST-OUT"
            : guest_status_id == guest_presence_status.GUEST_IN
            ? "GUEST-IN"
            : guest_status_id == guest_presence_status.NOT_CHECKIN
            ? "NOT CHECKIN"
            : "N/A",
          guest_status_id,
          "guest_status_id"
        )}
        {deviceIndicator(
          request_status == rooms_request_status.NO_REQ
            ? "NO REQUEST"
            : request_status == rooms_request_status.DND
            ? "DND"
            : request_status == rooms_request_status.MUR
            ? "MUR"
            : "N/A",
          request_status,
          "request_status"
        )}
      </div>
    </div>
  );
};

export default CardRoom;
