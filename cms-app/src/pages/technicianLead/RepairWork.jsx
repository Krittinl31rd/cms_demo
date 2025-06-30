import React, { useEffect, useState, useMemo, useRef } from "react";
import Spinner from "@/components/ui/Spinner";
import { GetMaintenanceTask } from "@/api/task";
import useStore from "@/store/store";
import AssignWorkForm from "@/components/technician/AssignWorkForm";
import CardSummary from "@/components/ui/CardSummary";
import Button from "@/components/ui/Button";
import { Plus, CheckCircle, Loader, UserCheck, X, XCircle } from "lucide-react";
import CardWork from "../../components/technician/CardWork";

const RepairWork = () => {
  const { token } = useStore((state) => state);
  const [roomList, setRoomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState([]);

  const fetchRoomList = async () => {
    setLoading(true);
    try {
      const response = await GetMaintenanceTask(token);
      setRoomList(response?.data || []);
      console.log(response?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomList();
  }, [token]);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex items-center justify-end mb-2">
        <Button>
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
      <div className="grid grid-cols-3 gap-2 mt-2">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center">
            <Spinner />
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
      {/* <AssignWorkForm
        technicians={users.filter((u) => u.role == "technician")}
      /> */}
    </div>
  );
};

export default RepairWork;
