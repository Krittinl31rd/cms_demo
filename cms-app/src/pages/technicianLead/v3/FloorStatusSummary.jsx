import React, { useState, useRef, useEffect } from "react";
import { maintenance_status } from "@/constant/common";
import { GetMaintenanceTask } from "@/api/task";
import useStore from "@/store/store";
import ModalPopup from "@/components/ui/ModalPopup";
import { client } from "@/constant/wsCommand";

const FloorStatusSummary = () => {
  const { token, getSummary } = useStore();
  const [data, setData] = useState([]);
  const ws = useRef(null);
  const [isWsReady, setIsWsReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  // Fetch data
  const fetchData = async () => {
    try {
      const statusIds = [
        maintenance_status.ASSIGNED,
        maintenance_status.PENDING,
        maintenance_status.IN_PROGRESS,
        maintenance_status.FIXED,
        maintenance_status.UNRESOLVED,
      ];
      const response = await GetMaintenanceTask(token, {
        status_id: statusIds.join(","),
      });
      setData(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // WebSocket setup
  useEffect(() => {
    ws.current = new WebSocket(import.meta.env.VITE_WS_URL);

    ws.current.onopen = () => setIsWsReady(true);
    ws.current.onmessage = (event) => handleCommand(JSON.parse(event.data));
    ws.current.onclose = () => setIsWsReady(false);

    return () => ws.current.close();
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
      setTimeout(() => sendWebSocketMessage(message), 500);
    }
  };

  const handleCommand = (msg) => {
    const { cmd } = msg;
    if (
      [client.MODBUS_STATUS, client.NEW_TASK, client.UPDATE_TASK].includes(cmd)
    ) {
      getSummary(token);
      fetchData();
    }
  };

  const rows = [
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

  const countBy = (floor, key, value) =>
    data.filter((t) => t.floor === floor && t[key] === value).length;

  const handleCellClick = (floor, row) => {
    const filtered = data.filter(
      (t) => t.floor === floor && t[row.key] === row.value
    );
    setModalData(filtered);
    setModalTitle(`${row.label} - Floor ${floor}`);
    setShowModal(true);
  };

  // Split floors into 3 tables of 10 floors each (1-10, 11-20, 21-30)
  const tableRanges = [
    [1, 10],
    [11, 20],
    [21, 30],
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Floor Room Status Summary</h2>

      {tableRanges.map(([start, end], idx) => {
        const floorsInRange = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i
        );

        return (
          <div key={idx} className="mb-6 overflow-auto border rounded-md">
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
                {rows.map((row, idxRow) => (
                  <tr key={idxRow} className="text-sm text-center">
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
                          className="border px-2 py-1 text-center cursor-pointer"
                        >
                          {count > 0 ? (
                            <span
                              onClick={() => handleCellClick(floor, row)}
                              className="underline text-blue-700"
                            >
                              {count}
                            </span>
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
        );
      })}

      {showModal && (
        <ModalPopup
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalTitle}
        >
          <div className="overflow-auto">
            <table className="min-w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="border px-2 py-1 text-left">Room</th>
                  <th className="border px-2 py-1 text-left">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {modalData.length > 0 ? (
                  modalData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{item.room_number}</td>
                      <td className="border px-2 py-1">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="border px-2 py-1 text-center text-gray-500"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ModalPopup>
      )}
    </div>
  );
};

export default FloorStatusSummary;
