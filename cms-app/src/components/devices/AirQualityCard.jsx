import React from "react";
import { Lightbulb, AirVent } from "lucide-react";

const controlMap = [
  { id: 1, unit: "µg/m³", name: "PM2.5" },
  { id: 2, unit: "ppm", name: "CO2" },
  { id: 3, unit: "ppb", name: "TVOC" },
  { id: 4, unit: "ppb", name: "HCHO" },
  { id: 5, unit: "℃", name: "Temperature" },
  { id: 6, unit: "%", name: "Humudity" },
];

const AirQualityCard = ({ devices = [] }) => {
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

export default AirQualityCard;
