import React, { useEffect, useState, useRef, useMemo } from "react";
import useStore from "@/store/store";
import { client } from "@/constant/wsCommand";
import Spinner from "@/components/ui/Spinner";
import { device_type, maintenance_status } from "@/constant/common";
import dayjs from "dayjs";
import Summary from "@/components/ui/Summary";
import { GetRoomDevicesLog } from "@/api/room";
import ChartElement from "@/components/ui/Chart";

const Chart = () => {
  const { token, getSummary } = useStore((state) => state);
  const [loading, setLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);
  const [filterFloor, setFilterFloor] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const activeSection = { lable: "Daily Chart", type: "chart" };

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const query = {
        device_type_id: device_type.TEMPERATURE,
        date: selectedDate,
      };
      const response = await GetRoomDevicesLog(token, query);
      setTaskList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskList();
  }, [selectedDate]);

  const filteredRooms = useMemo(() => {
    return taskList.filter((room) => {
      const matchFloor =
        filterFloor === "all" || room.floor?.toString() == filterFloor;
      return matchFloor;
    });
  }, [taskList, filterFloor]);

  const groupedRoomsByFloor = useMemo(() => {
    const grouped = {};

    filteredRooms.forEach((room) => {
      const floor = room.floor ?? "Unknown";
      if (!grouped[floor]) grouped[floor] = [];
      grouped[floor].push(room);
    });

    return Object.entries(grouped)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .reduce((obj, [floor, rooms]) => {
        obj[floor] = rooms;
        return obj;
      }, {});
  }, [filteredRooms]);

  const uniqueFloors = useMemo(() => {
    const floors = [...new Set(taskList.map((room) => room.floor))];
    return floors
      .filter((f) => f !== null && f !== undefined)
      .sort((a, b) => a - b);
  }, [taskList]);

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

  const handleCommand = async (msg, currentActiveSection) => {
    const { cmd, param } = msg;

    switch (cmd) {
      case client.LOGIN:
        if (param.status === "success") {
          console.log("Login success");
        }
        break;

      case client.NEW_TASK:
        fetchTaskList();
        getSummary(token);
        break;

      case client.UPDATE_TASK:
        fetchTaskList();
        getSummary(token);
        break;

      default:
        break;
    }
  };

  return (
    <>
      <div className="flex justify-end items-center gap-2 mb-2">
        {/* Filter by Floor */}

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className=" border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {loading ? (
        <div className="w-full flex flex-col items-center justify-center">
          <Spinner />
          Loading rooms....
        </div>
      ) : (
        <ChartElement
          data={taskList}
          activeSection={activeSection}
          selectedDate={selectedDate}
          setSelectedDate={(i) => setSelectedDate(i)}
        />
      )}
    </>
  );
};
{
  /* <Table key={floor} floor={floor} rooms={rooms} /> */
}
export default Chart;
