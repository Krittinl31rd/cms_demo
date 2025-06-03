import React, { useState } from "react";
import { Lightbulb, AirVent } from "lucide-react";
import classNames from "classnames";

const ElementDevices = ({ room }) => {
  const { name, rcu, devices } = room;

  const [isOn, setIsOn] = useState(false);
  const toggle = () => setIsOn(!isOn);

  const [sliders, setSliders] = useState({
    dimmer: 0,
    air: 16,
  });

  const [progress, setProgress] = useState({
    dimmer: 0,
    air: 0,
  });

  const [speed, setSpeed] = useState(0);
  const changeSpeed = (value) => setSpeed(value);

  const handleSliderChange = (deviceKey, min, max) => (e) => {
    const value = Number(e.target.value);
    const percent = ((value - min) / (max - min)) * 100;

    setSliders((prev) => ({ ...prev, [deviceKey]: value }));
    setProgress((prev) => ({ ...prev, [deviceKey]: percent }));
  };

  const environment = [
    {
      name: "AQ1",
      attr: [
        {
          name: "PM2.5",
          value: 1,
          unit: "µg/m3",
        },
        {
          name: "PM100",
          value: 1,
          unit: "µg/m3",
        },
        {
          name: "CO₂",
          value: 123,
          unit: "ppm",
        },
        {
          name: "TVOC",
          value: 140,
          unit: "ppb",
        },
        {
          name: "Temperature",
          value: 27.0,
          unit: "Celsius",
        },
        {
          name: "Humidity",
          value: 51,
          unit: "Percentage",
        },
      ],
    },
    {
      name: "Power 1",
      attr: [
        {
          name: "Voltage",
          value: 231.34,
          unit: "Volt",
        },
        {
          name: "Current",
          value: 0.01,
          unit: "Amp",
        },
        {
          name: "Watt",
          value: 2345.67,
          unit: "Watt",
        },
        {
          name: "Enegry",
          value: 0.59,
          unit: "Unit",
        },
        {
          name: "PF",
          value: 0.96,
          unit: "",
        },
        {
          name: "Freequency",
          value: 48.51,
          unit: "Hz",
        },
      ],
    },
  ];

  const statusColor = {
    1: "bg-green-500",
    0: "bg-gray-400",
  };

  const deviceIndicator = (label, state) => (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${
          statusColor[state] || "bg-gray-400"
        }`}
      ></span>
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">
        RCU Information{" "}
        <span
          className={`px-2 py-1 text-sm rounded-full ${
            room.status === "online"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {room.status === "online" ? "Online" : "Offline"}
        </span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm  border-b border-gray-300 pb-2">
        <div>
          <span className="font-medium">IP Address:</span> {rcu.ip}
        </div>
        <div>
          <span className="font-medium">MAC Address:</span> {rcu.mac}
        </div>
        <div>
          <span className="font-medium">Protocol:</span> {rcu.protocol}
        </div>
      </div>
      <h3 className="font-semibold">Room Status</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border-b border-gray-300 pb-2">
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
      <h3 className="font-semibold">Room Environment</h3>
      <div className="grid grid-cols-2 gap-2 border-b border-gray-300 pb-2">
        {environment.map((item, i) => (
          <div
            key={i}
            className="col-span-2 md:col-span-1 p-2 rounded-xl shadow-md"
          >
            <h3 className="font-semibold">{item.name}</h3>
            {item.attr.map((att, index) => (
              <div key={index} className="grid grid-cols-3">
                <label className="text-start">{att.name}</label>
                <label className="text-end">{att.value}</label>
                <label className="text-end">{att.unit}</label>
              </div>
            ))}
          </div>
        ))}
      </div>
      <h3 className="font-semibold">Devices</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-gray-300 pb-2">
        {/* Air */}
        <div className="col-span-2 p-2 rounded-xl shadow-md flex flex-col items-center justify-between gap-2">
          <div className="w-full flex items-center gap-2">
            <div
              className={classNames(
                "inline-flex items-center justify-center p-2 w-8 h-8 rounded-full",
                {
                  "bg-blue-200": speed > 0,
                  "bg-gray-300": speed <= 0,
                }
              )}
            >
              <AirVent
                className={speed <= 0 ? "text-gray-500" : "text-blue-500"}
              />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold">Meeting air</h1>
            </div>
            <button
              onClick={() => changeSpeed(0)}
              className={classNames(
                "text-xs font-semibold text-white bg-red-400 rounded-sm p-1 cursor-pointer"
              )}
            >
              OFF
            </button>
          </div>
          <div className="w-full flex items-center justify-between gap-2">
            <span className="flex-1 text-center font-semibold">
              {sliders.air}℃
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeSpeed(1)}
                className={classNames(
                  "text-xs text-black font-semibold border border-gray-300  rounded-sm p-1 cursor-pointer",
                  {
                    "bg-blue-400 ": speed == 1,
                    "text-white ": speed == 1,
                    "border-0": speed == 1,
                  }
                )}
              >
                LOW
              </button>
              <button
                onClick={() => changeSpeed(2)}
                className={classNames(
                  "text-xs text-black font-semibold border border-gray-300  rounded-sm p-1 cursor-pointer",
                  {
                    "bg-blue-400 ": speed == 2,
                    "text-white ": speed == 2,
                    "border-0": speed == 2,
                  }
                )}
              >
                MED
              </button>
              <button
                onClick={() => changeSpeed(3)}
                className={classNames(
                  "text-xs text-black font-semibold border border-gray-300  rounded-sm p-1 cursor-pointer",
                  {
                    "bg-blue-400 ": speed == 3,
                    "text-white ": speed == 3,
                    "border-0": speed == 3,
                  }
                )}
              >
                HIGH
              </button>
            </div>
          </div>
          <div className="relative w-full flex items-center justify-center gap-2 mt-2">
            <div
              className="thumb-indicator"
              style={{
                left: `${progress.air}%`,
              }}
            >
              ▼
            </div>
            <input
              type="range"
              min="16"
              max="30"
              value={sliders.air}
              style={{
                background: `linear-gradient(to right, #51a2ff ${progress.air}%, #d1d5dc ${progress.air}%)`,
              }}
              className={classNames(
                "w-full h-10 rounded-sm appearance-none bg-gray-300 transition-all duration-300 focus:outline-none",
                {
                  "range-thumb-blue": sliders.air > 16,
                  "range-thumb-gray": sliders.air <= 16,
                }
              )}
              onChange={handleSliderChange("air", 16, 30)}
            />
            <span className="absolute left-2 text-xs font-semibold text-white pointer-events-none">
              16
            </span>
            <span className="absolute right-2 text-xs font-semibold text-white pointer-events-none">
              30
            </span>
          </div>
        </div>

        {/* Dimmer */}
        <div className="col-span-2 p-2 rounded-xl shadow-md flex flex-col items-center justify-between gap-2">
          <div className="w-full flex items-center gap-2">
            <div
              className={classNames(
                "inline-flex items-center justify-center p-2 w-8 h-8 rounded-full",
                {
                  "bg-orange-200": sliders.dimmer > 0,
                  "bg-gray-300": sliders.dimmer <= 0,
                }
              )}
            >
              <Lightbulb
                className={
                  sliders.dimmer <= 0 ? "text-gray-500" : "text-orange-500"
                }
              />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold">Dimmer</h1>
            </div>
          </div>
          <div>
            <span className="font-semibold">{sliders.dimmer}%</span>
          </div>
          <div className="relative w-full flex items-center justify-center gap-2">
            <div
              className="thumb-indicator"
              style={{
                left: `${progress.dimmer}%`,
              }}
            >
              ▼
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.dimmer}
              style={{
                background: `linear-gradient(to right, #ff8904 ${progress.dimmer}%, #d1d5dc ${progress.dimmer}%)`,
              }}
              className={classNames(
                "w-full h-10 rounded-sm appearance-none bg-gray-300 transition-all duration-300 focus:outline-none",
                {
                  "range-thumb-orange": sliders.dimmer > 0,
                  "range-thumb-gray": sliders.dimmer <= 0,
                }
              )}
              onChange={handleSliderChange("dimmer", 0, 100)}
            />
            <span className="absolute left-2 text-xs font-semibold text-white pointer-events-none">
              OFF
            </span>

            <span className="absolute right-2 text-xs font-semibold text-white pointer-events-none">
              100%
            </span>
          </div>
        </div>

        {/* Light */}
        <div
          onClick={toggle}
          className="p-2 rounded-xl shadow-md flex flex-col items-center justify-between"
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
            <h1 className="font-semibold">Foyer Light</h1>
          </div>
          <div className="w-full flex items-center justify-center gap-2">
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
      </div>
    </div>
  );
};

export default ElementDevices;
