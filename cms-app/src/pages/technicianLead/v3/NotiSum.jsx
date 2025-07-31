import React, { useEffect, useState, useRef, useMemo } from "react";
import CardRoom from "@/components/ui/CardRoom";
import ModalPopup from "@/components/ui/ModalPopup";
import ElementDevices from "@/components/ui/ElementDevices";
import { GetRooms } from "@/api/room";
import useStore from "@/store/store";
import { client } from "@/constant/wsCommand";
import Spinner from "@/components/ui/Spinner";
import { device_type, maintenance_status } from "@/constant/common";
import dayjs from "dayjs";
import { technician_type } from "@/constant/common";
import { GetNotifications } from "@/api/summary";
import Table from "@/components/ui/Table";
import Summary from "@/components/ui/Summary";

const NotiSum = () => {
  const { token } = useStore((state) => state);
  const [loading, setLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const activeSection = { lable: "Notification", type: "notification_sum" };

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const response = await GetNotifications(token);
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
        break;

      case client.UPDATE_TASK:
        fetchTaskList();
        break;

      default:
        break;
    }
  };

  return (
    <>
      {loading ? (
        <div className="w-full flex flex-col items-center justify-center">
          <Spinner />
          Loading rooms....
        </div>
      ) : (
        <SummaryNotification
          data={taskList}
          activeSection={activeSection}
          setSelectedDate={(i) => setSelectedDate(i)}
        />
      )}
    </>
  );
};

export default NotiSum;
