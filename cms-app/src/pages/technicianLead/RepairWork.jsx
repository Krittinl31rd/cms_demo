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
import {
  Plus,
  CheckCircle,
  Loader,
  UserCheck,
  X,
  XCircle,
  ListFilter,
  Cog,
  Wifi,
} from "lucide-react";
import CardWork from "@/components/technician/CardWork";
import ModalPopup from "@/components/ui/ModalPopup";
import { DeleteTask } from "@/api/task";
import { toast } from "react-toastify";
import { client } from "@/constant/wsCommand";
import { maintenance_status } from "@/constant/common";
import FilterCheckbox from "@/components/ui/FilterCheckbox";
import {
  useRoomFilters,
  doesTaskMatchFilters,
  getFilterLabel,
} from "@/utilities/helpers";

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
  const [isModalFilterOpen, setIsModalFilterOpen] = useState(false);
  const [isWsReady, setIsWsReady] = useState(false);
  const ws = useRef(null);
  const [filters, setFilters] = useState([]);
  const { toggleFilter } = useRoomFilters(filters, setFilters);
  const [searchTerm, setSearchTerm] = useState("");

  const taskStatusFilterOptions = [
    {
      key: "taskStatus",
      value: maintenance_status.ASSIGNED,
      label: "Assigned",
    },
    {
      key: "taskStatus",
      value: maintenance_status.IN_PROGRESS,
      label: "In Progress",
    },
    { key: "taskStatus", value: maintenance_status.FIXED, label: "Complete" },
    {
      key: "taskStatus",
      value: maintenance_status.UNRESOLVED,
      label: "Unresolved",
    },
  ];

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const response = await GetMaintenanceTask(token);
      setTaskList(response?.data || []);
      console.log(response?.data);
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
      // fetchTaskList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  const statusCounts = useMemo(() => {
    const roomWithIPSet = new Set();
    const counts = {
      assigned: 0,
      in_progress: 0,
      completed: 0,
      unresolved: 0,
      total_rcu: 0,
      rcu_online: 0,
      rcu_offline: 0,
    };

    taskList.forEach(({ status_id, ip_address, room_id, is_online }) => {
      // Count by status_id
      if (status_id === 2) counts.assigned += 1;
      else if (status_id === 3) counts.in_progress += 1;
      else if (status_id === 4) counts.completed += 1;
      else if (status_id === 5) counts.unresolved += 1;

      // Count unique room with ip (RCU)
      if (ip_address && room_id && !roomWithIPSet.has(room_id)) {
        roomWithIPSet.add(room_id);

        // Count online/offline once per unique room
        if (is_online === 1) counts.rcu_online += 1;
        else if (is_online === 0) counts.rcu_offline += 1;
      }
    });

    counts.total_rcu = roomWithIPSet.size;

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

  const assignedToTypeOptions = useMemo(() => {
    const map = new Map();
    taskList.forEach((task) => {
      if (task.assigned_to_type && !map.has(task.assigned_to_type)) {
        let label;
        if (task.assigned_to_type == 1) {
          label = "RCU";
        } else if (task.assigned_to_type == 2) {
          label = "ELECTRICAL";
        } else if (task.assigned_to_type == 3) {
          label = "OTHER";
        }
        map.set(task.assigned_to_type, label);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [taskList]);

  const createdByOptions = useMemo(() => {
    const map = new Map();
    taskList.forEach((task) => {
      if (task.created_by && !map.has(task.created_by)) {
        map.set(
          task.created_by,
          task.created_by_name || `User ${task.created_by}`
        );
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [taskList]);

  const filteredTasks = useMemo(() => {
    let filtered = [...taskList];

    // Apply filters
    if (filters.length > 0) {
      filtered = filtered.filter((task) => doesTaskMatchFilters(task, filters));
    }

    // Apply search
    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((task) =>
        task.room_number?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [taskList, filters, searchTerm]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex items-center justify-end mb-2">
        <Button onClick={() => setAssignWork(true)}>
          <Plus />
          Assign New Work
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <CardSummary
          title="Total RCUs"
          value={statusCounts?.total_rcu}
          icon={Cog}
          iconColor="text-blue-800"
          borderColor="border-blue-800"
        />
        <CardSummary
          title="RCU Online"
          value={statusCounts?.rcu_online}
          icon={Wifi}
          iconColor="text-green-800"
          borderColor="border-green-800"
        />
        <CardSummary
          title="RCU Offline"
          value={statusCounts?.rcu_offline}
          icon={Wifi}
          iconColor="text-red-800"
          borderColor="border-red-800"
        />
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
          title="Complete"
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
      <div className="w-full flex items-center justify-between gap-2 bg-white rounded-xl shadow-xl p-4">
        <input
          type="text"
          placeholder="Search by room number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="ml-2 text-sm text-gray-500 hover:underline"
          >
            Clear
          </button>
        )}
        <button
          onClick={() => setIsModalFilterOpen(true)}
          className="flex items-center gap-1  text-primary cursor-pointer rounded-lg p-1 hover:bg-gray-100"
        >
          Filter <ListFilter size={16} />
        </button>
      </div>
      <h1 className="text-sm">
        Filter by:{" "}
        <span className="font-semibold">
          {filters.length === 0
            ? "None"
            : filters
                .map((f) =>
                  getFilterLabel(
                    f,
                    technicianList,
                    maintenance_status,
                    createdByOptions,
                    assignedToTypeOptions
                  )
                )
                .join(", ")}
        </span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center">
            <Spinner />
            Loading tasks...
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
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
      <ModalPopup
        isOpen={isModalFilterOpen}
        onClose={() => setIsModalFilterOpen(false)}
        title={`Filter`}
      >
        <div className="space-y-2 text-sm">
          <button
            className="absolute top-12 right-6 text-primary font-semibold hover:underline cursor-pointer"
            onClick={() => {
              // setSearch("");
              setFilters([]);
            }}
          >
            Reset
          </button>
          <h1 className=" font-semibold">Task status</h1>
          <div className="w-full flex items-center flex-wrap gap-2 pb-2 border-b border-gray-300">
            {taskStatusFilterOptions.map(({ key, value, label }) => {
              const filterKey = `${key}_${value}`;
              return (
                <FilterCheckbox
                  key={filterKey}
                  filterKey={filterKey}
                  label={label}
                  filters={filters}
                  toggleFilter={toggleFilter}
                />
              );
            })}
          </div>
          <h1 className="font-semibold">Assign by</h1>
          <div className="w-full max-h-32 overflow-auto flex items-center flex-wrap gap-2 pb-2 border-b border-gray-300">
            {technicianList.map((tech) => {
              const filterKey = `assign_${tech.id}`;
              return (
                <FilterCheckbox
                  key={filterKey}
                  filterKey={filterKey}
                  label={tech.full_name}
                  filters={filters}
                  toggleFilter={toggleFilter}
                />
              );
            })}
          </div>

          <h1 className="font-semibold">Created By</h1>
          <div className="w-full max-h-32 overflow-auto flex items-center flex-wrap gap-2 pb-2 border-b border-gray-300">
            {createdByOptions.map(({ value, label }) => {
              const filterKey = `createdBy_${value}`;
              return (
                <FilterCheckbox
                  key={filterKey}
                  filterKey={filterKey}
                  label={label}
                  filters={filters}
                  toggleFilter={toggleFilter}
                />
              );
            })}
          </div>

          <h1 className="font-semibold">Technician type</h1>
          <div className="w-full max-h-32 overflow-auto flex items-center flex-wrap gap-2 pb-2 border-b border-gray-300">
            {assignedToTypeOptions.map(({ value, label }) => {
              const filterKey = `assignedToType_${value}`;
              return (
                <FilterCheckbox
                  key={filterKey}
                  filterKey={filterKey}
                  label={label}
                  filters={filters}
                  toggleFilter={toggleFilter}
                />
              );
            })}
          </div>
        </div>
      </ModalPopup>
    </div>
  );
};

export default RepairWork;
