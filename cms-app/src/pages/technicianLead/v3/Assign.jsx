import React, { useEffect, useState, useRef, useMemo } from "react";
import useStore from "@/store/store";
import { client } from "@/constant/wsCommand";
import Spinner from "@/components/ui/Spinner";
import dayjs from "dayjs";
import { GetTechnician, GetRoomNumberFloor } from "@/api/task";
import AssignWorkForm from "@/components/technician/AssignWorkForm";

const Assgin = () => {
  const { token, getSummary } = useStore((state) => state);
  const [rooms, setRooms] = useState([]);
  const [technicianList, setTechnicianList] = useState([]);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);

  const activeSection = { lable: "Assigned", type: "assign_task" };

  const fetchTechnicianList = async () => {
    try {
      const response = await GetTechnician(token);
      setTechnicianList(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTechnicianList();
  }, [token]);

  const fetchRooms = async () => {
    try {
      const response = await GetRoomNumberFloor(token);
      setRooms(response?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [token]);

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
    <>
      <h2 className="text-2xl font-bold mb-2">{activeSection.lable}</h2>
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md">
        <AssignWorkForm technicianList={technicianList} rooms={rooms} />
      </div>
    </>
  );
};

export default Assgin;
