import React, { useEffect, useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import {
  GetMaintenanceTask,
  GetTechnician,
  GetRoomNumberFloor,
} from "@/api/task";
import useStore from "@/store/store";
import AssignWorkForm from "@/components/technician/AssignWorkForm";
import UpdateWorkForm from "@/components/technician/UpdateWorkForm";
import DetailWork from "@/components/technician/DetailWork";
import CardSummary from "@/components/ui/CardSummary";
import Button from "@/components/ui/Button";
import { Plus, CheckCircle, Loader, UserCheck, X, XCircle } from "lucide-react";
import CardWork from "@/components/technician/CardWork";
import ModalPopup from "@/components/ui/ModalPopup";
import { DeleteTask } from "@/api/task";
import { toast } from "react-toastify";
import { client } from "@/constant/wsCommand";

const RepairWork = () => {
  const { token } = useStore((state) => state);
  const [taskList, setTaskList] = useState([]);
  const [technicianList, setTechnicianList] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignWork, setAssignWork] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewTask, setViewTask] = useState(false);
  const [isEditTask, setEditTask] = useState(false);
  const [isDeleteTask, setDeleteTask] = useState(false);

  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const response = await GetMaintenanceTask(token);
      setTaskList(response?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskList();
  }, [token]);

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

  const handleDeleteTask = async (id) => {
    try {
      const response = await DeleteTask(id, token);
      toast.success(response?.data?.message || "Delete task successfully");
      setDeleteTask(false);
      fetchTaskList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  const statusCounts = useMemo(() => {
    const counts = {
      assigned: 0,
      in_progress: 0,
      completed: 0,
      unresolved: 0,
    };

    taskList.forEach((task) => {
      switch (task.status_id) {
        case 2:
          counts.assigned += 1;
          break;
        case 3:
          counts.in_progress += 1;
          break;
        case 4:
          counts.completed += 1;
          break;
        case 5:
          counts.unresolved += 1;
          break;
        default:
          break;
      }
    });
    return counts;
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

      default:
        break;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex items-center justify-end mb-2">
        <Button onClick={() => setAssignWork(true)}>
          <Plus />
          Assign New Work
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center">
            <Spinner />
            Loading tasks...
          </div>
        ) : taskList.length > 0 ? (
          taskList.map((task) => (
            <CardWork
              key={task.id}
              task={task}
              onSelect={(selected) => setSelectedTask(selected)}
              onView={() => setViewTask(true)}
              onEdit={() => setEditTask(true)}
              onDelete={() => setDeleteTask(true)}
            />
          ))
        ) : (
          <p className="col-span-1 sm:col-span-2 xl:col-span-3 text-center">
            No maintenance tasks found.
          </p>
        )}
      </div>
      <ModalPopup
        isOpen={isAssignWork}
        onClose={() => setAssignWork(false)}
        title={"Assign New Work"}
      >
        <AssignWorkForm
          fetchTaskList={fetchTaskList}
          onAssign={() => setAssignWork(false)}
          technicianList={technicianList}
          rooms={rooms}
        />
      </ModalPopup>
      <ModalPopup
        isOpen={isViewTask}
        onClose={() => setViewTask(false)}
        title={`Work Details Room ${selectedTask?.floor}${selectedTask?.room_number} #${selectedTask?.id} `}
      >
        <DetailWork selectedTask={selectedTask}></DetailWork>
      </ModalPopup>
      <ModalPopup
        isOpen={isEditTask}
        onClose={() => setEditTask(false)}
        title={`#${selectedTask?.id} Room ${selectedTask?.floor}${selectedTask?.room_number}`}
      >
        <UpdateWorkForm
          selectedTask={selectedTask}
          onEdit={() => setEditTask(false)}
          fetchTaskList={fetchTaskList}
          rooms={rooms}
          technicianList={technicianList}
        />
      </ModalPopup>
      <ModalPopup
        isOpen={isDeleteTask}
        onClose={() => setDeleteTask(false)}
        title={`Delete Task #${selectedTask?.id}`}
      >
        <div className="text-sm space-y-2 ">
          <p>
            Are you sure you want to delete <strong>#{selectedTask?.id}</strong>{" "}
            Room{" "}
            <strong>
              {selectedTask?.floor}
              {selectedTask?.room_number}
            </strong>{" "}
            ?
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="gray"
              onClick={() => setDeleteTask(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleDeleteTask(selectedTask?.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </ModalPopup>
    </div>
  );
};

export default RepairWork;
