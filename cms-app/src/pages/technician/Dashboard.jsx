import React, { useEffect, useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import { UpdateTask } from "@/api/task";
import useStore from "@/store/store";
import CardSummary from "@/components/ui/CardSummary";
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
import CardWorkTech from "@/components/technician/CardWorkTech";
import UpdateDetailWork from "@/components/technician/UpdateDetailWork";
import ModalPopup from "@/components/ui/ModalPopup";
import dayjs from "dayjs";
import { GetMaintenanceTaskByUserID } from "@/api/task";
import { toast } from "react-toastify";
import { maintenance_status } from "@/constant/common";
import { colorBadge } from "@/utilities/helpers";
import { client } from "@/constant/wsCommand";

const Dashboard = () => {
  const { user, token } = useStore((state) => state);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewTask, setViewTask] = useState(false);
  const [statusCounts, setStatusCounts] = useState({});
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const statusIds = [
        maintenance_status.ASSIGNED,
        maintenance_status.IN_PROGRESS,
      ];

      const query = {
        status_id: statusIds.join(","),
      };

      const response = await GetMaintenanceTaskByUserID(user?.id, token, query);
      setTaskList(response?.data.tasks || []);
      setStatusCounts(response?.data.statusCounts || {});
      console.log(response.data);
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

      case client.NEW_TASK:
        if (param) {
          const newTask = param?.task;
          setTaskList((prev) => {
            const exists = prev.find((t) => t.id === newTask.id);
            if (exists) return prev;
            return [newTask, ...prev];
          });
        }
        break;

      case client.UPDATE_TASK:
        if (param) {
          console.log(param);
          const newTask = param?.task;
          const taskId = param?.task?.id;
          if (
            newTask.status_id == maintenance_status.PENDING ||
            newTask.status_id == maintenance_status.ASSIGNED ||
            newTask.status_id == maintenance_status.IN_PROGRESS
          ) {
            if (
              user?.id == Number(newTask?.assigned_to) &&
              newTask.status_id == maintenance_status.ASSIGNED
            ) {
              setTaskList((prev) => {
                const exists = prev.find((t) => t.id === newTask.id);
                if (exists) return prev;
                return [newTask, ...prev];
              });
            } else {
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
          } else {
            setTaskList((prev) => prev.filter((task) => task.id !== taskId));
          }
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
        <div className="hidden sm:grid  sm:grid-cols-2 md:grid-cols-4 gap-2">
          <CardSummary
            title="Assigned"
            value={statusCounts?.assigned}
            icon={UserCheck}
            iconColor="text-yellow-500"
            borderColor="border-yellow-500"
          />
          <CardSummary
            title="In Progress"
            value={statusCounts?.in_progress}
            icon={Loader}
            iconColor="text-blue-500"
            borderColor="border-blue-500"
          />
          <CardSummary
            title="Completed"
            value={statusCounts?.completed}
            icon={CheckCircle}
            iconColor="text-green-500"
            borderColor="border-green-500"
          />
          <CardSummary
            title="Unresolved"
            value={statusCounts?.unresolved}
            icon={XCircle}
            iconColor="text-red-500"
            borderColor="border-red-500"
          />
        </div>

        <div className="w-full space-y-2">
          <h1 className="font-semibold text-xl">My Task</h1>
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
                  No task list.
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

export default Dashboard;
