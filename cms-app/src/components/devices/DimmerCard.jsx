import React, { useState, useEffect, useCallback } from "react";
import { Lightbulb } from "lucide-react";
import classNames from "classnames";
import { CheckFunctionModbus } from "@/utilities/helpers";
import { client } from "@/constant/wsCommand";

const DimmerCard = ({ devices, sendWebSocketMessage, ip_address }) => {
  const [brightValues, setBrightValues] = useState({});
  const [committedDevices, setCommittedDevices] = useState({});

  const getBrightnessValue = (device) =>
    device?.controls.find((c) => c.control_id === 2)?.value ?? 0;

  const handleSliderChange = useCallback(
    (deviceId) => (e) => {
      const value = Number(e.target.value);
      setBrightValues((prev) => ({ ...prev, [deviceId]: value }));
    },
    []
  );

  const handleSliderCommit = useCallback(
    (device) => () => {
      const currentValue = getBrightnessValue(device);
      const newValue = brightValues[device.device_id];

      if (newValue === undefined || newValue === currentValue) return;

      const brightnessControl = device.controls.find(
        (c) => c.control_id === 102
      );
      const { address, funct } = CheckFunctionModbus(brightnessControl?.value);

      setCommittedDevices((prev) => ({
        ...prev,
        [device.device_id]: newValue,
      }));

      sendWebSocketMessage({
        cmd: client.WRITE_REGISTER,
        param: {
          address,
          value: newValue,
          slaveId: 1,
          ip: ip_address,
          fc: funct === 30000 ? 6 : funct === 10000 ? 5 : 0,
        },
      });
    },
    [brightValues, sendWebSocketMessage, ip_address]
  );

  useEffect(() => {
    const updatedValues = { ...brightValues };
    const updatedCommits = { ...committedDevices };
    let hasUpdate = false;

    devices.forEach((device) => {
      const actualValue = getBrightnessValue(device);
      const committed = committedDevices[device.device_id];

      if (committed !== undefined && committed === actualValue) {
        delete updatedValues[device.device_id];
        delete updatedCommits[device.device_id];
        hasUpdate = true;
      }
    });

    if (hasUpdate) {
      setBrightValues(updatedValues);
      setCommittedDevices(updatedCommits);
    }
  }, [devices, committedDevices, brightValues]);

  if (!devices.length) return null;

  return (
    <>
      {devices.map((device) => {
        const actualValue = getBrightnessValue(device);
        const currentValue =
          brightValues[device.device_id] !== undefined
            ? brightValues[device.device_id]
            : actualValue;

        const percent = (currentValue / 100) * 100;

        return (
          <div
            key={device.device_id}
            className="col-span-2 p-2 rounded-xl shadow-md flex flex-col items-center justify-between gap-2 h-[140px]"
          >
            {/* Header */}
            <div className="w-full flex items-center gap-2">
              <div
                className={classNames(
                  "inline-flex items-center justify-center p-2 w-8 h-8 rounded-full",
                  {
                    "bg-orange-200": currentValue > 0,
                    "bg-gray-300": currentValue <= 0,
                  }
                )}
              >
                <Lightbulb
                  className={
                    currentValue <= 0 ? "text-gray-500" : "text-orange-500"
                  }
                />
              </div>
              <div className="flex-1">
                <h1 className="font-semibold truncate">{device.device_name}</h1>
              </div>
            </div>

            {/* Display Value */}
            <div>
              <span className="font-semibold">{currentValue}%</span>
            </div>

            {/* Slider */}
            <div className="relative w-full flex items-center justify-center gap-2">
              <div className="thumb-indicator" style={{ left: `${percent}%` }}>
                ▼
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentValue}
                onChange={handleSliderChange(device.device_id)}
                onMouseUp={handleSliderCommit(device)}
                onTouchEnd={handleSliderCommit(device)}
                style={{
                  background: `linear-gradient(to right, #ff8904 ${percent}%, #d1d5dc ${percent}%)`,
                }}
                className={classNames(
                  "w-full h-10 rounded-sm appearance-none bg-gray-300 transition-all duration-300 focus:outline-none",
                  {
                    "range-thumb-orange": currentValue > 0,
                    "range-thumb-gray": currentValue <= 0,
                  }
                )}
              />
              <span className="absolute left-2 text-xs font-semibold text-white pointer-events-none">
                OFF
              </span>
              <span className="absolute right-2 text-xs font-semibold text-white pointer-events-none">
                100%
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default DimmerCard;
