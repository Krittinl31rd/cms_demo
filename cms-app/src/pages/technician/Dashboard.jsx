import React, { useEffect, useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import {
  GetMaintenanceTask,
  GetTechnician,
  GetRoomNumberFloor,
} from "@/api/task";
import useStore from "@/store/store";
import CardSummary from "@/components/ui/CardSummary";
import Button from "@/components/ui/Button";
import { Plus, CheckCircle, Loader, UserCheck, X, XCircle } from "lucide-react";
import CardWorkTech from "@/components/technician/CardWorkTech";
import ModalPopup from "@/components/ui/ModalPopup";
import { nameStatusId, colorBadge } from "@/utilities/helpers";
import dayjs from "dayjs";
import { GetMaintenanceTaskByUserID } from "@/api/task";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user, token } = useStore((state) => state);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const response = await GetMaintenanceTaskByUserID(user?.id, token);
      setTaskList(response?.data.tasks || []);
      console.log(response?.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskList();
  }, [token]);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <CardSummary
          title="Assigned"
          value={9999}
          icon={UserCheck}
          iconColor="text-yellow-500"
          borderColor="border-yellow-500"
        />
        <CardSummary
          title="In Progress"
          value={9999}
          icon={Loader}
          iconColor="text-blue-500"
          borderColor="border-blue-500"
        />
        <CardSummary
          title="Completed"
          value={9999}
          icon={CheckCircle}
          iconColor="text-green-500"
          borderColor="border-green-500"
        />
        <CardSummary
          title="Unresolved"
          value={9999}
          icon={XCircle}
          iconColor="text-red-500"
          borderColor="border-red-500"
        />
      </div>

      <div className="w-full space-y-2">
        <div className="w-full space-y-2">
          <h1 className="font-semibold text-xl">Task</h1>
          {loading ? (
            <div className="w-full flex items-center justify-center">
              <Spinner />
              Loading tasks...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {taskList.length > 0 ? (
                taskList.map((task) => (
                  // <CardWork
                  //   key={task.id}
                  //   task={task}
                  //   onSelect={(selected) => setSelectedTask(selected)}
                  //   onView={() => setViewTask(true)}
                  //   onEdit={() => setEditTask(true)}
                  //   onDelete={() => setDeleteTask(true)}
                  // />
                  <CardWorkTech key={task.id} task={task} />
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
    </div>
  );
};

export default Dashboard;
