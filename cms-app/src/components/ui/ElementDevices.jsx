import React, { useState } from "react";
import classNames from "classnames";
import {
  guest_check_status,
  guest_presence_status,
  device_status,
  device_type,
  rooms_request_status,
  guestCheckStatusColor,
  guestPresenceStatusColor,
  roomsRequestStatusColor,
  statusColor,
} from "@/constant/common.js";
import AirConCard from "@/components/devices/AirConCard";
import AirQualityCard from "@/components/devices/AirQualityCard";
import DimmerCard from "@/components/devices/DimmerCard";
import LightingCard from "@/components/devices/LightingCard";
import PowerCard from "@/components/devices/PowerCard";

const ElementDevices = ({ room, sendWebSocketMessage }) => {
  const {
    is_online,
    devices,
    room_check_status,
    guest_status_id,
    request_status,
    ip_address,
    mac_address,
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
    <div className="space-y-2">
      <h3 className="font-semibold">
        RCU Information{" "}
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
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm  border-b border-gray-300 pb-2">
        <div>
          <span className="font-medium">IP:</span>{" "}
          {ip_address ? ip_address : "N/A"}
        </div>
        <div>
          <span className="font-medium">MAC:</span>{" "}
          {mac_address ? mac_address : "N/A"}
        </div>
        <div>
          <span className="font-medium">Protocol:</span> Modbus
        </div>
      </div>
      <h3 className="font-semibold">Room Status</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border-b border-gray-300 pb-2">
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
        {(() => {
          // type_id 25, device_name ESM, control[0]: value
          const device_esm = devices.find(
            (i) => i.type_id == 25 && i.device_name == "ESM"
          );
          const ctrl_esm = device_esm.controls[0];
          return <span>ESM {ctrl_esm.value}</span>;
        })()}
      </div>{" "}
      <h3 className="font-semibold">Motion & Sensor</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border-b border-gray-300 pb-2">
        {/* motion sensor*/}
        {(() => {
          const motionDevices = devices.filter(
            (dev) => dev.type_id === device_type.MOTION
          );

          if (motionDevices.length > 0) {
            return motionDevices.map((motion, index) => {
              const motionStatus = motion.controls.find(
                (ctrl) => ctrl.control_id == 1
              );

              return (
                <div
                  key={motion.device_id || index}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      statusColor[motionStatus?.value] || "bg-gray-400"
                    }`}
                  ></span>
                  <span className="text-sm">{motion.device_name}</span>
                </div>
              );
            });
          }

          return <p>No motion sensor device in room.</p>;
        })()}
      </div>
      <h3 className="font-semibold">Room weather</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border-b border-gray-300 pb-2">
        {(() => {
          const weatherDevices = devices.filter(
            (dev) => dev.type_id === device_type.TEMPERATURE
          );

          if (weatherDevices.length > 0) {
            return weatherDevices.map((wea, index) => {
              const weatherStatus = wea.controls.find(
                (ctrl) => ctrl.control_id == 1
              );

              return (
                <div
                  key={wea.device_id || index}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm">{wea.device_name}</span>
                  <span className="font-semibold">
                    {(weatherStatus.value / 10).toFixed(1)}
                  </span>
                </div>
              );
            });
          }

          return <p>No weather device in room.</p>;
        })()}
      </div>
      <h3 className="font-semibold">Room Environment</h3>
      <div className="grid grid-cols-2 gap-2 border-b border-gray-300 pb-2">
        {/* type 20 = POWER, type 21 = AIR_QAULITY */}
        {(() => {
          const powerDevices = devices.filter(
            (dev) => dev.type_id === device_type.POWER
          );
          const airQualityDevices = devices.filter(
            (dev) => dev.type_id === device_type.AIR_QAULITY
          );

          if (powerDevices.length > 0 || airQualityDevices.length > 0) {
            return (
              <>
                {powerDevices.length > 0 && (
                  <PowerCard devices={powerDevices} />
                )}
                {airQualityDevices.length > 0 && (
                  <AirQualityCard devices={airQualityDevices} />
                )}
              </>
            );
          }

          return <p>No device environment in room.</p>;
        })()}
      </div>
      <h3 className="font-semibold">Devices</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center justify-center border-b border-gray-300 pb-2">
        {/* Devices */}
        {(() => {
          const airDevices = devices.filter(
            (dev) => dev.type_id === device_type.AIR
          );
          const dimmerDevices = devices.filter(
            (dev) => dev.type_id === device_type.DIMMER
          );
          const lightingDevices = devices.filter(
            (dev) => dev.type_id === device_type.LIGHTING
          );

          if (
            airDevices.length > 0 ||
            dimmerDevices.length > 0 ||
            lightingDevices.length > 0
          ) {
            return (
              <>
                {airDevices.length > 0 && (
                  <AirConCard
                    ip_address={ip_address}
                    devices={airDevices}
                    sendWebSocketMessage={sendWebSocketMessage}
                  />
                )}
                {dimmerDevices.length > 0 && (
                  <DimmerCard
                    ip_address={ip_address}
                    devices={dimmerDevices}
                    sendWebSocketMessage={sendWebSocketMessage}
                  />
                )}
                {lightingDevices.length > 0 && (
                  <LightingCard
                    ip_address={ip_address}
                    devices={lightingDevices}
                    sendWebSocketMessage={sendWebSocketMessage}
                  />
                )}
              </>
            );
          }

          return <p>No device in room.</p>;
        })()}
      </div>
    </div>
  );
};

export default ElementDevices;
