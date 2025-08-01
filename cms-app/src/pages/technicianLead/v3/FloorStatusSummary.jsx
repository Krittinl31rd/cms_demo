import React, { useState, useRef } from "react";
import { useEffect } from "react";
import { device_type, maintenance_status } from "@/constant/common";
import {
  GetMaintenanceTask,
  GetTechnician,
  GetRoomNumberFloor,
} from "@/api/task";
import useStore from "@/store/store";
import ModalPopup from "@/components/ui/ModalPopup";
import { client } from "@/constant/wsCommand";

const FloorStatusSummary = () => {
  const [selectedRange, setSelectedRange] = useState([1, 10]);
  const { token, getSummary } = useStore();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);

  const fetchData = async () => {
    try {
      const statusIds = [
        maintenance_status.ASSIGNED,
        maintenance_status.PENDING,
        maintenance_status.IN_PROGRESS,
        maintenance_status.FIXED,
        maintenance_status.UNRESOLVED,
      ];
      const query = {
        status_id: statusIds.join(","),
      };
      const response = await GetMaintenanceTask(token, query);
      setData(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCellClick = (floor, row) => {
    const filtered = data.filter(
      (t) => t.floor === floor && t[row.key] === row.value
    );
    setModalTitle(`${row.label} - Floor ${floor}`);
    setModalData(filtered);
    setShowModal(true);
  };

  const floorRanges = Array.from({ length: 10 }, (_, i) => [
    i * 10 + 1,
    i * 10 + 10,
  ]);

  const floorsInRange = Array.from(
    { length: selectedRange[1] - selectedRange[0] + 1 },
    (_, i) => selectedRange[0] + i
  );

  const countBy = (floor, key, value) =>
    data.filter((t) => t.floor === floor && t[key] === value).length;

  const rows = [
    { label: "Online", color: "bg-green-100", key: "is_online", value: 1 },
    { label: "Offline", color: "bg-gray-100", key: "is_online", value: 0 },
    { label: "Fault", color: "bg-red-100", key: "assigned_to_type", value: 1 },
    {
      label: "HI-Temp",
      color: "bg-orange-100",
      key: "assigned_to_type",
      value: 4,
    },
    { label: "WIP", color: "bg-yellow-100", key: "status_id", value: 3 },
    { label: "Fixed", color: "bg-blue-100", key: "status_id", value: 4 },
  ];

  useEffect(() => {
    ws.current = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      setIsWsReady(true);
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleCommand(msg);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.current.onclose = () => {
      // console.log('WebSocket Disconnected');
      setIsWsReady(false);
    };

    return () => {
      ws.current.close();
    };
  }, [token]);

  useEffect(() => {
    if (isWsReady && token) {
      sendWebSocketMessage({ cmd: client.LOGIN, param: { token } });
    }
  }, [isWsReady, token]);

  const sendWebSocketMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      // console.warn('WebSocket not open, retrying...');
      setTimeout(() => sendWebSocketMessage(message), 500);
    }
  };

  const handleCommand = (msg) => {
    const { cmd, param } = msg;

    switch (cmd) {
      case client.LOGIN:
        if (param.status === "success") {
          console.log("Login success");
        }
        break;

      case client.MODBUS_STATUS: {
        getSummary(token);
        break;
      }

      case client.NEW_TASK:
        getSummary(token);
        break;

      case client.UPDATE_TASK:
        getSummary(token);
        break;

      default:
        break;
    }
  };

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-4">Floor Room Status Summary</h2>

      {/* Floor Range Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="font-medium text-gray-600">Select Floor Range:</span>
        {floorRanges.map(([start, end], idx) => (
          <button
            key={idx}
            onClick={() => setSelectedRange([start, end])}
            className={`px-3 py-1 rounded border text-sm font-medium ${
              selectedRange[0] === start
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {start}-{end}
          </button>
        ))}
      </div>

      {/* Excel-style table */}
      <div className="overflow-auto border rounded-md">
        <table className="min-w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-sm">
              <th className="border px-2 py-1 w-32 text-left">Status</th>
              {floorsInRange.map((floor) => (
                <th key={floor} className="border px-2 py-1 text-center">
                  {floor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="text-sm text-center">
                <td
                  className={`border px-2 py-1 text-left font-medium ${row.color}`}
                >
                  {row.label}
                </td>
                {floorsInRange.map((floor) => {
                  const count = countBy(floor, row.key, row.value);
                  return (
                    <td
                      key={floor}
                      className="border px-2 py-1 cursor-pointer hover:bg-blue-50"
                      //   onClick={() => handleCellClick(floor, row)}
                    >
                      {count > 0 ? (
                        <span className="underline text-blue-700">{count}</span>
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* {showModal && (
        <ModalPopup
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Room `}
        >
          <ul className="space-y-2 text-sm">
            {modalData.length > 0 ? (
              modalData.map((item, idx) => (
                <li key={idx} className="border-b pb-1">
                  Room:{" "}
                  <span className="font-semibold">{item.room_number}</span>,
                  Status ID: {item.status_id}, Online:{" "}
                  {item.is_online ? "Yes" : "No"}
                </li>
              ))
            ) : (
              <li className="text-gray-500">No data found</li>
            )}
          </ul>
        </ModalPopup>
      )} */}
    </div>
  );
};

export default FloorStatusSummary;
