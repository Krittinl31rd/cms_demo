import React, { useEffect, useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import { UpdateTask } from "@/api/task";
import useStore from "@/store/store";
import CardWorkHistory from "@/components/technician/CardWorkHistory";
import Button from "@/components/ui/Button";
import {
  Plus,
  CheckCircle,
  Loader,
  UserCheck,
  X,
  XCircle,
  Camera,
  PlayCircle,
} from "lucide-react";
import ModalPopup from "@/components/ui/ModalPopup";
import dayjs from "dayjs";
import { GetMaintenanceTask } from "@/api/task";
import { toast } from "react-toastify";
import { maintenance_status } from "@/constant/common";
import { colorBadge, taskStatusId } from "@/utilities/helpers";
import DetailWork from "@/components/technician/DetailWork";
import { client } from "@/constant/wsCommand";

const History = () => {
  const { token, user } = useStore((state) => state);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewTask, setViewTask] = useState(false);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);

  const fetchTaskList = async (
    statusIds = [maintenance_status.UNRESOLVED, maintenance_status.FIXED]
  ) => {
    setLoading(true);
    try {
      const query = {
        status_id: Array.isArray(statusIds) ? statusIds.join(",") : statusIds,
        assigned_to: user?.id,
      };
      const response = await GetMaintenanceTask(token, query);
      setTaskList(response?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.id) {
      fetchTaskList();
    }
  }, [token, user?.id]);

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
        if (param.status == "success") {
          console.log("Login success");
        }
        break;

      // case client.NEW_TASK:
      //   if (param) {
      //     const newTask = param?.task;
      //     setTaskList((prev) => {
      //       const exists = prev.find((t) => t.id === newTask.id);
      //       if (exists) return prev;
      //       return [newTask, ...prev];
      //     });
      //   }
      //   break;

      case client.UPDATE_TASK:
        if (param) {
          const newTask = param?.task;
          const taskId = param?.task?.id;
          setTaskList((prev) =>
            prev.map((task) =>
              task.id == taskId
                ? {
                    ...task,
                    ...newTask,
                  }
                : task
            )
          );
        }
        break;

      case client.DELETE_TASK:
        if (param) {
          const taskId = Number(param?.task_id);
          setTaskList((prev) => prev.filter((task) => task.id !== taskId));
        }
        break;

      default:
        break;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="w-full space-y-2">
          <h1 className="font-semibold text-xl">History</h1>
          {loading ? (
            <div className="w-full flex items-center justify-center">
              <Spinner />
              Loading tasks...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 p-2">
              {taskList.length > 0 ? (
                taskList.map((task) => (
                  <CardWorkHistory
                    key={task.id}
                    task={task}
                    onSelect={(selected) => setSelectedTask(selected)}
                    onView={() => setViewTask(true)}
                  />
                ))
              ) : (
                <p className="text-center sm:col-span-2 xl:col-span-3">
                  No task list history.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <ModalPopup
        isOpen={isViewTask}
        onClose={() => setViewTask(false)}
        title={`Work Details Room ${selectedTask?.floor}${selectedTask?.room_number} #${selectedTask?.id} `}
      >
        <DetailWork selectedTask={selectedTask}></DetailWork>
      </ModalPopup>
    </>
  );
};

export default History;
