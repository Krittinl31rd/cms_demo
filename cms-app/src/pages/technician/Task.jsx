import React, { useEffect, useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import { UpdateTask } from "@/api/task";
import useStore from "@/store/store";
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
import CardWorkTech from "@/components/technician/CardWorkTech";
import UpdateDetailWork from "@/components/technician/UpdateDetailWork";
import ModalPopup from "@/components/ui/ModalPopup";
import dayjs from "dayjs";
import { GetMaintenanceTaskByUserID } from "@/api/task";
import { toast } from "react-toastify";
import { maintenance_status } from "@/constant/common";
import { colorBadge } from "@/utilities/helpers";
import { client } from "@/constant/wsCommand";

const Task = () => {
  const { user, token } = useStore((state) => state);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewTask, setViewTask] = useState(false);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const statusIds = [maintenance_status.IN_PROGRESS];

      const query = {
        status_id: statusIds.join(","),
      };

      const response = await GetMaintenanceTaskByUserID(user?.id, token, query);
      setTaskList(response?.data.tasks || []);
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
          <h1 className="font-semibold text-xl">Task i'm working on</h1>
          {loading ? (
            <div className="w-full flex items-center justify-center">
              <Spinner />
              Loading tasks...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 p-2">
              {taskList.length > 0 ? (
                taskList.map((task) => (
                  <CardWorkTech
                    key={task.id}
                    task={task}
                    onSelect={(selected) => setSelectedTask(selected)}
                    onView={() => setViewTask(true)}
                  />
                ))
              ) : (
                <p className="text-center sm:col-span-2 xl:col-span-3">
                  No task list in progress.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <ModalPopup isOpen={viewTask} onClose={() => setViewTask(false)}>
        <UpdateDetailWork
          fetchTaskList={fetchTaskList}
          selectedTask={selectedTask}
          setViewTask={(e) => setViewTask(e)}
          viewTask={viewTask}
        ></UpdateDetailWork>
      </ModalPopup>
    </>
  );
};

export default Task;
