import React, { useState, useEffect, useCallback } from "react";
import { AirVent } from "lucide-react";
import classNames from "classnames";
import { CheckFunctionModbus } from "@/utilities/helpers";

const AirConCard = ({ devices, sendWebSocketMessage, ip_address }) => {
  const [tempValues, setTempValues] = useState({});
  const [committedTemps, setCommittedTemps] = useState({});

  const getTempValue = (dev) =>
    dev.controls.find((c) => c.control_id == 3)?.value ?? 25;

  const handleSliderChange = useCallback(
    (deviceId) => (e) => {
      const value = Number(e.target.value);
      setTempValues((prev) => ({ ...prev, [deviceId]: value }));
    },
    []
  );

  const handleSliderCommit = useCallback(
    (dev) => () => {
      const tempControl = dev.controls.find((c) => c.control_id == 103);
      const newValue = tempValues[dev.device_id];

      if (newValue === undefined) return;

      const { address, funct } = CheckFunctionModbus(tempControl?.value);
      setCommittedTemps((prev) => ({ ...prev, [dev.device_id]: newValue }));

      sendWebSocketMessage({
        cmd: "write_register",
        param: {
          address,
          value: newValue,
          slaveId: 1,
          ip: ip_address,
          fc: funct === 30000 ? 6 : funct === 10000 ? 5 : 0,
        },
      });
    },
    [tempValues, sendWebSocketMessage, ip_address]
  );

  const changeSpeed = useCallback(
    (dev, level) => {
      const ctrlSpeed = dev.controls.find((c) => c.control_id === 102);
      const { address, funct } = CheckFunctionModbus(ctrlSpeed?.value);

      sendWebSocketMessage({
        cmd: "write_register",
        param: {
          address,
          value: level,
          slaveId: 1,
          ip: ip_address,
          fc: funct === 30000 ? 6 : funct === 10000 ? 5 : 0,
        },
      });
    },
    [sendWebSocketMessage, ip_address]
  );

  useEffect(() => {
    const updated = {};
    let hasUpdate = false;

    devices.forEach((dev) => {
      const actualTemp = getTempValue(dev);
      const committed = committedTemps[dev.device_id];

      if (committed !== undefined && committed === actualTemp) {
        updated[dev.device_id] = undefined;
        hasUpdate = true;
      }
    });

    if (hasUpdate) {
      setTempValues((prev) => {
        const newValues = { ...prev };
        Object.keys(updated).forEach((key) => delete newValues[key]);
        return newValues;
      });
      setCommittedTemps((prev) => {
        const newCommits = { ...prev };
        Object.keys(updated).forEach((key) => delete newCommits[key]);
        return newCommits;
      });
    }
  }, [devices, committedTemps]);

  if (!devices.length) return null;

  return (
    <>
      {devices.map((dev) => {
        const deviceId = dev.device_id;
        const statusControl = dev.controls.find((c) => c.control_id === 1);
        const speedControl = dev.controls.find((c) => c.control_id === 2);

        const currentTemp =
          tempValues[deviceId] !== undefined
            ? tempValues[deviceId]
            : getTempValue(dev);

        const percent = ((currentTemp - 16) / 16) * 100;

        return (
          <div
            key={deviceId}
            className="col-span-2 p-2 rounded-xl shadow-md flex flex-col items-center justify-between gap-2 h-[140px]"
          >
            {/* Header */}
            <div className="w-full flex items-center gap-2">
              <div
                className={classNames(
                  "inline-flex items-center justify-center p-2 w-8 h-8 rounded-full",
                  {
                    "bg-blue-200": speedControl?.value > 0,
                    "bg-gray-300": speedControl?.value <= 0,
                  }
                )}
              >
                <AirVent
                  className={
                    speedControl?.value <= 0 ? "text-gray-500" : "text-blue-500"
                  }
                />
              </div>
              <div className="flex-1">
                <h1 className="font-semibold truncate">{dev.device_name}</h1>
              </div>
              <button
                onClick={() => changeSpeed(dev, 0)}
                className="text-xs font-semibold text-white bg-red-400 rounded-sm px-2 py-1"
              >
                OFF
              </button>
            </div>

            {/* Speed Control */}
            <div className="w-full flex items-center justify-between gap-2">
              <span className="flex-1 text-center font-semibold">
                {currentTemp}℃{/* Display Temperature */}
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((level, idx) => (
                  <button
                    key={idx}
                    onClick={() => changeSpeed(dev, level)}
                    className={classNames(
                      "text-xs font-semibold border rounded-sm px-2 py-1 cursor-pointer",
                      {
                        "bg-blue-400 text-white border-0":
                          speedControl?.value === level,
                        "text-black border-gray-300":
                          speedControl?.value !== level,
                      }
                    )}
                  >
                    {["LOW", "MED", "HIGH"][idx]}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="relative w-full flex items-center justify-center gap-2 mt-2">
              <div className="thumb-indicator" style={{ left: `${percent}%` }}>
                ▼
              </div>
              <input
                type="range"
                min="16"
                max="32"
                value={currentTemp}
                onChange={handleSliderChange(deviceId)}
                onMouseUp={handleSliderCommit(dev)}
                onTouchEnd={handleSliderCommit(dev)}
                style={{
                  background: `linear-gradient(to right, #51a2ff ${percent}%, #d1d5dc ${percent}%)`,
                }}
                className={classNames(
                  "w-full h-10 rounded-sm appearance-none bg-gray-300 transition-all duration-300 focus:outline-none",
                  {
                    "range-thumb-blue": currentTemp > 16,
                    "range-thumb-gray": currentTemp <= 16,
                  }
                )}
              />
              <span className="absolute left-2 text-xs font-semibold text-white pointer-events-none">
                16
              </span>
              <span className="absolute right-2 text-xs font-semibold text-white pointer-events-none">
                32
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default AirConCard;
