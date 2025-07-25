import React from "react";

const FloorFilter = ({ floors = [], selected, onChange }) => {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {floors.map((floor) => (
        <option key={floor} value={floor}>
          {floor === "all" ? "All floor" : `Floor ${floor}`}
        </option>
      ))}
    </select>
  );
};

export default FloorFilter;
