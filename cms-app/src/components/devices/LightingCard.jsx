import React, { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import classNames from "classnames";
import { CheckFunctionModbus } from "@/utilities/helpers";

const LightingCard = ({ devices, sendWebSocketMessage, ip_address }) => {
  if (!devices.length) return null;

  const toggleStatus = (dev) => {
    const current = dev.controls.find((c) => c.control_id == 1)?.value == 1;
    const newStatus = !current;

    const ctrlStatus = dev.controls.find((d) => d.control_id == 101);
    const { address, funct } = CheckFunctionModbus(ctrlStatus.value);

    sendWebSocketMessage({
      cmd: "write_register",
      param: {
        address: address,
        value: newStatus ? 1 : 0,
        slaveId: 1,
        ip: ip_address,
        fc: funct == 30000 ? 6 : funct == 10000 ? 5 : 0,
      },
    });
  };

  return (
    <>
      {devices.map((dev) => {
        const isOn = dev.controls.find((c) => c.control_id == 1)?.value == 1;

        return (
          <div
            key={dev.device_id}
            onClick={() => toggleStatus(dev)}
            className="p-2 rounded-xl shadow-md flex flex-col items-center justify-between cursor-pointer h-[80px]"
          >
            <div className="w-full flex items-center gap-2">
              <div
                className={classNames(
                  "inline-flex items-center justify-center p-2 w-8 h-8 rounded-full",
                  {
                    "bg-orange-200": isOn,
                    "bg-gray-300": !isOn,
                  }
                )}
              >
                <Lightbulb
                  className={isOn ? "text-orange-500" : "text-gray-500"}
                />
              </div>
              <h1 className="font-semibold">{dev.device_name}</h1>
            </div>

            <div className="w-full flex items-center justify-center gap-2 mt-2">
              <button
                className={classNames(
                  "relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none",
                  {
                    "bg-orange-400": isOn,
                    "bg-gray-300": !isOn,
                  }
                )}
              >
                <span
                  className={classNames(
                    "inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300",
                    { "translate-x-6": isOn, "translate-x-1": !isOn }
                  )}
                />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default LightingCard;
