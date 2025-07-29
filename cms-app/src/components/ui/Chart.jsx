import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const groupRawSensorLogs = (logs, sensor = "Temperature") => {
  const grouped = {};

  logs
    .filter((log) => log.device_name === sensor)
    .forEach((log) => {
      const date = dayjs(log.created_at).format("YYYY-MM-DD HH:mm");
      const value = Number(log.value) / 10;

      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(value);
    });

  return Object.entries(grouped)
    .map(([date, values]) => ({
      date,
      value: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const RawChart = ({ title, data, color }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            tickFormatter={(v) => dayjs(v).format("MM-DD HH:mm")}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            dot={false}
            strokeWidth={2}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const SensorTrendChartSimple = ({ data, activeSection }) => {
  const rooms = useMemo(() => {
    const uniqueRooms = new Set(data.map((d) => d.room_number));
    return Array.from(uniqueRooms).sort();
  }, [data]);

  const floors = useMemo(() => {
    const uniqueFloors = new Set(data.map((d) => d.floor));
    return Array.from(uniqueFloors).sort((a, b) => a - b);
  }, [data]);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);

  const allowAllRoomsOption = rooms.length <= 50;

  const filteredData = useMemo(() => {
    if (selectedRoom) {
      return data.filter((d) => d.room_number === selectedRoom);
    }
    if (selectedFloor) {
      return data.filter((d) => d.floor === selectedFloor);
    }

    return [];
  }, [data, selectedRoom, selectedFloor]);

  const tempData = groupRawSensorLogs(filteredData, "Temperature");
  const humData = groupRawSensorLogs(filteredData, "Humidity");

  return (
    <div className="space-y-4">
      {/* Filter */}
      <h2 className="text-2xl font-bold">{activeSection?.lable}</h2>
      <div className="flex gap-4 mb-4 bg-white rounded-lg shadow-md p-4">
        <div>
          <label className="block font-semibold mb-1 text-xs">
            Select Room
          </label>
          <select
            value={selectedRoom || ""}
            onChange={(e) => {
              setSelectedRoom(e.target.value || null);
              setSelectedFloor(null);
            }}
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allowAllRoomsOption && <option value="">All Rooms</option>}
            {rooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-xs">
            Select Floor
          </label>
          <select
            value={selectedFloor || ""}
            onChange={(e) => {
              setSelectedFloor(e.target.value ? Number(e.target.value) : null);
              setSelectedRoom(null);
            }}
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Floors</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>
      </div>
      {data.length > 0 ? (
        <>
          {filteredData.length === 0 ? (
            <p className="text-center italic text-gray-500">
              Please select a room or floor to display data.
            </p>
          ) : (
            <>
              <RawChart title="Temperature" data={tempData} color="#4f46e5" />
              <RawChart title="Humidity" data={humData} color="#82ca9d" />
            </>
          )}
        </>
      ) : (
        <p className="text-center italic text-gray-500">
          This date is result not found.
        </p>
      )}
    </div>
  );
};

export default SensorTrendChartSimple;
