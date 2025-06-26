import React from "react";

const controlMap = [
  { id: 1, unit: "Volt", name: "Voltage", scale: 10 },
  { id: 2, unit: "Amp", name: "Current", scale: 1000 },
  { id: 3, unit: "Watt", name: "Power", scale: 10 },
  { id: 4, unit: "", name: "Power Factor", scale: 100 },
  { id: 5, unit: "Kwh", name: "Energy", scale: 100 },
  { id: 6, unit: "Hz", name: "Frequency", scale: 10 },
];

const PowerCard = ({ devices = [] }) => {
  if (!devices.length) return null;

  return (
    <>
      {devices.map((dev) => {
        const environment = controlMap.map(({ id, name, unit, scale }) => {
          const ctrl = dev.controls?.find((c) => c.control_id === id);
          return {
            name,
            value:
              ctrl?.value != null ? (ctrl.value / scale).toFixed(2) : "N/A",
            unit,
          };
        });

        return (
          <div
            key={dev.device_id || dev.device_name}
            className="col-span-2 md:col-span-1 p-2 rounded-xl shadow-md"
          >
            <h3 className="font-semibold">{dev.device_name}</h3>
            {environment.map((att) => (
              <div key={att.name} className="grid grid-cols-3">
                <label className="text-start">{att.name}</label>
                <label className="text-end font-semibold">{att.value}</label>
                <label className="text-end">{att.unit}</label>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};

export default PowerCard;
