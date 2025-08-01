import React, { useState } from "react";

const HotelMasterSettings = () => {
  const [selectedRoomType, setSelectedRoomType] = useState("standard");

  const roomTypes = [
    { id: "standard", name: "Standard" },
    { id: "deluxe", name: "Deluxe" },
    { id: "suite", name: "Suite" },
    { id: "presidential", name: "Presidential" },
  ];

  const statusMeta = {
    vacant_clean: {
      label: "Vacant (Clean)",
      fields: ["fanspeed", "temp", "lighting", "curtain", "hvacMode"],
    },
    occupied_dirty: {
      label: "Occupied (Dirty)",
      fields: ["fanspeed", "lighting", "curtain"],
    },
    checkin: {
      label: "Check-in",
      fields: [
        "fanspeed",
        "temp",
        "lighting",
        "curtain",
        "hvacMode",
        "lowerTempLimit",
        "upperTempLimit",
        "coolModeDefault",
        "heatModeDefault",
        "fanCycle",
        "onDuration",
        "offDuration",
        "humidityTrigger",
      ],
    },
    checkout: {
      label: "Check-out",
      fields: ["fanspeed", "temp", "lighting", "curtain", "hvacMode"],
    },
    guestin: {
      label: "Guest In",
      fields: ["fanspeed", "temp", "lighting", "curtain", "hvacMode"],
    },
    guestout: {
      label: "Guest Out",
      fields: ["fanspeed", "temp", "lighting", "curtain", "hvacMode"],
    },
    maid_tech_in: {
      label: "Maid/Tech In",
      fields: ["fanspeed", "temp", "lighting"],
    },
    maid_tech_out: { label: "Maid/Tech Out", fields: ["fanspeed", "lighting"] },
  };

  const [statusSettings, setStatusSettings] = useState(
    Object.keys(statusMeta).reduce((acc, key) => {
      acc[key] = {
        fanspeed: 1,
        temp: 25,
        lighting: 50,
        curtain: "open",
        hvacMode: "auto",
        lowerTempLimit: 16,
        upperTempLimit: 30,
        coolModeDefault: 23,
        heatModeDefault: 26,
        fanCycle: false,
        onDuration: 30,
        offDuration: 30,
        humidityTrigger: 70,
      };
      return acc;
    }, {})
  );

  const updateSetting = (status, key, value) => {
    setStatusSettings((prev) => ({
      ...prev,
      [status]: {
        ...prev[status],
        [key]: value,
      },
    }));
  };

  const StatusCard = ({ statusId }) => {
    const settings = statusSettings[statusId];
    const visibleFields = statusMeta[statusId].fields;

    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        <h3 className="text-md font-semibold text-center mb-2 border-b pb-1">
          {statusMeta[statusId].label}
        </h3>
        <div className="grid grid-cols-1 gap-2 text-sm">
          {visibleFields.includes("fanspeed") && (
            <div className="flex justify-between items-center">
              <label>Fan Speed</label>
              <select
                value={settings.fanspeed}
                onChange={(e) =>
                  updateSetting(statusId, "fanspeed", parseInt(e.target.value))
                }
                className="border px-2 py-1 rounded"
              >
                <option value={0}>Off</option>
                <option value={1}>Low</option>
                <option value={2}>Med</option>
                <option value={3}>High</option>
              </select>
            </div>
          )}

          {visibleFields.includes("temp") && (
            <div className="flex justify-between items-center">
              <label>Temperature (°C)</label>
              <input
                type="number"
                value={settings.temp}
                onChange={(e) =>
                  updateSetting(statusId, "temp", parseInt(e.target.value))
                }
                className="border px-2 py-1 rounded w-20 text-center"
              />
            </div>
          )}

          {visibleFields.includes("lighting") && (
            <div className="flex justify-between items-center">
              <label>Lighting</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  value={settings.lighting}
                  min={0}
                  max={100}
                  onChange={(e) =>
                    updateSetting(
                      statusId,
                      "lighting",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-24"
                />
                <span>{settings.lighting}%</span>
              </div>
            </div>
          )}

          {visibleFields.includes("curtain") && (
            <div className="flex justify-between items-center">
              <label>Curtain</label>
              <select
                value={settings.curtain}
                onChange={(e) =>
                  updateSetting(statusId, "curtain", e.target.value)
                }
                className="border px-2 py-1 rounded"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          )}

          {visibleFields.includes("hvacMode") && (
            <div className="flex justify-between items-center">
              <label>HVAC Mode</label>
              <select
                value={settings.hvacMode}
                onChange={(e) =>
                  updateSetting(statusId, "hvacMode", e.target.value)
                }
                className="border px-2 py-1 rounded"
              >
                <option value="off">Off</option>
                <option value="cool">Cool</option>
                <option value="heat">Heat</option>
                <option value="auto">Auto</option>
                <option value="eco">Eco</option>
              </select>
            </div>
          )}

          {visibleFields.includes("lowerTempLimit") && (
            <div className="flex justify-between items-center">
              <label>Temp Limits</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={settings.lowerTempLimit}
                  onChange={(e) =>
                    updateSetting(
                      statusId,
                      "lowerTempLimit",
                      parseInt(e.target.value)
                    )
                  }
                  className="border w-16 text-center"
                />
                <input
                  type="number"
                  value={settings.upperTempLimit}
                  onChange={(e) =>
                    updateSetting(
                      statusId,
                      "upperTempLimit",
                      parseInt(e.target.value)
                    )
                  }
                  className="border w-16 text-center"
                />
              </div>
            </div>
          )}

          {visibleFields.includes("coolModeDefault") && (
            <div className="flex justify-between items-center">
              <label>Cool/Heat Default</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={settings.coolModeDefault}
                  onChange={(e) =>
                    updateSetting(
                      statusId,
                      "coolModeDefault",
                      parseInt(e.target.value)
                    )
                  }
                  className="border w-16 text-center"
                />
                <input
                  type="number"
                  value={settings.heatModeDefault}
                  onChange={(e) =>
                    updateSetting(
                      statusId,
                      "heatModeDefault",
                      parseInt(e.target.value)
                    )
                  }
                  className="border w-16 text-center"
                />
              </div>
            </div>
          )}

          {visibleFields.includes("fanCycle") && (
            <div className="flex justify-between items-center">
              <label>Fan Cycle</label>
              <input
                type="checkbox"
                checked={settings.fanCycle}
                onChange={(e) =>
                  updateSetting(statusId, "fanCycle", e.target.checked)
                }
              />
            </div>
          )}

          {visibleFields.includes("onDuration") && (
            <div className="flex justify-between items-center">
              <label>On/Off Duration</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={settings.onDuration}
                  onChange={(e) =>
                    updateSetting(
                      statusId,
                      "onDuration",
                      parseInt(e.target.value)
                    )
                  }
                  className="border w-16 text-center"
                />
                <input
                  type="number"
                  value={settings.offDuration}
                  onChange={(e) =>
                    updateSetting(
                      statusId,
                      "offDuration",
                      parseInt(e.target.value)
                    )
                  }
                  className="border w-16 text-center"
                />
              </div>
            </div>
          )}

          {visibleFields.includes("humidityTrigger") && (
            <div className="flex justify-between items-center">
              <label>Humidity Trigger</label>
              <input
                type="number"
                value={settings.humidityTrigger}
                onChange={(e) =>
                  updateSetting(
                    statusId,
                    "humidityTrigger",
                    parseInt(e.target.value)
                  )
                }
                className="border w-20 text-center"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-0">
      <div className="flex gap-2">
        <div className="w-48">
          <div className="bg-white border border-gray-300 rounded-lg p-4 h-fit">
            <h3 className="text-md font-semibold text-center mb-3 border-b pb-1">
              Room Type
            </h3>
            <div className="space-y-2">
              {roomTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedRoomType(type.id)}
                  className={`w-full p-2 text-left rounded-lg border text-sm transition-colors ${
                    selectedRoomType === type.id
                      ? "bg-blue-100 border-blue-300 text-blue-800 font-medium"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.keys(statusSettings).map((key) => (
              <StatusCard key={key} statusId={key} />
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelMasterSettings;
