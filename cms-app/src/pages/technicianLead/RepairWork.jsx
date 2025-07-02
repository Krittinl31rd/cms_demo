import React, { useEffect, useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import { GetMaintenanceTask, GetTechnician } from "@/api/task";
import useStore from "@/store/store";
import AssignWorkForm from "@/components/technician/AssignWorkForm";
import CardSummary from "@/components/ui/CardSummary";
import Button from "@/components/ui/Button";
import { Plus, CheckCircle, Loader, UserCheck, X, XCircle } from "lucide-react";
import CardWork from "@/components/technician/CardWork";
import ModalPopup from "@/components/ui/ModalPopup";

const RepairWork = () => {
  const { token } = useStore((state) => state);
  const [roomList, setRoomList] = useState([]);
  const [technicianList, setTechnicianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignWork, setAssignWork] = useState(false);
  const [selectedTask, setSelectedTask] = useState([]);

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const response = await GetMaintenanceTask(token);
      setRoomList(response?.data || []);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-2">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center">
            <Spinner />
            Loading tasks...
          </div>
        ) : (
          roomList.map((task) => (
            <CardWork
              key={task.id}
              task={task}
              // onSelect={(selected) => setSelectedTask(selected)}
            />
          ))
        )}
      </div>
      <ModalPopup
        isOpen={isAssignWork}
        onClose={() => setAssignWork(false)}
        title={"Assign New Work"}
      >
        <AssignWorkForm technicianList={technicianList} />
      </ModalPopup>
    </div>
  );
};

export default RepairWork;
