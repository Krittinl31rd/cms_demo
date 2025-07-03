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
import CardSummary from "@/components/ui/CardSummary";
import Button from "@/components/ui/Button";
import { Plus, CheckCircle, Loader, UserCheck, X, XCircle } from "lucide-react";
import CardWork from "@/components/technician/CardWork";
import ModalPopup from "@/components/ui/ModalPopup";
import { nameStatusId, colorBadge } from "@/utilities/helpers";
import dayjs from "dayjs";

const RepairWork = () => {
  const { token } = useStore((state) => state);
  const [taskList, settaskList] = useState([]);
  const [technicianList, setTechnicianList] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssignWork, setAssignWork] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewTask, setViewTask] = useState(false);
  const [isEditTask, setEditTask] = useState(false);
  const [isDeleteTask, setDeleteTask] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchTaskList = async () => {
    setLoading(true);
    try {
      const response = await GetMaintenanceTask(token);
      settaskList(response?.data || []);
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
        <div className="grid grid-cols-2 gap-4 text-black">
          <div className="space-y-2">
            <div className="w-full bg-gray-200/50 p-2 rounded-lg space-y-2">
              <h1 className="font-semibold mb-4">Assignment Infomation</h1>
              <div>
                Assigned To: {""}
                <span className="font-semibold ">
                  {selectedTask?.assigned_to_name}
                </span>
              </div>
              <div>
                Assigned By: {""}
                <span className="font-semibold ">
                  {selectedTask?.created_by_name
                    ? selectedTask?.created_by_name
                    : "System"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                Status: {""}
                <div
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    colorBadge[selectedTask?.status_id]
                  }`}
                >
                  <span>{nameStatusId[selectedTask?.status_id]}</span>
                </div>
              </div>
            </div>
            <div className="">
              <div className="w-full bg-gray-200/50 p-2 rounded-lg space-y-2">
                <h1 className="font-semibold mb-4">Timeline</h1>
                <div>
                  Started:{" "}
                  <span className="font-semibold ">
                    {selectedTask?.started_at
                      ? dayjs(selectedTask.started_at).format(
                          "DD MMMM YYYY HH:mm:ss"
                        )
                      : "Not set"}
                  </span>
                </div>
                <div>
                  Ended: {""}
                  <span className="font-semibold ">
                    {selectedTask?.ended_at
                      ? dayjs(selectedTask.ended_at).format(
                          "DD MMMM YYYY HH:mm:ss"
                        )
                      : "Not set"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-200/50 p-2 rounded-lg space-y-2 max-h-24 overflow-y-auto">
              <h1 className="font-semibold mb-4">Problem Description</h1>
              <p>
                {selectedTask?.problem_description ||
                  "No description provided."}
              </p>
            </div>
            <div className="w-full bg-gray-200/50 p-2 rounded-lg space-y-2 max-h-24 overflow-y-auto">
              <h1 className="font-semibold mb-4">Fix Description</h1>
              <p>
                {selectedTask?.fix_description || "No description provided."}
              </p>
            </div>
          </div>
          <div className="col-span-2">
            <h1 className="font-semibold mb-4">Report Images</h1>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h1 className="font-semibold mb-2 text-center">Before</h1>
                <div className="max-h-64 overflow-y-auto bg-gray-200/50 border-2 border-dashed border-gray-400 p-2 rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTask?.image_before &&
                    JSON.parse(selectedTask?.image_before).length > 0 ? (
                      JSON.parse(selectedTask?.image_before).map(
                        (image, index) => (
                          <img
                            key={index}
                            src={`${
                              import.meta.env.VITE_BASE_BEFORE_PATH
                            }/${image}`}
                            alt={`before${selectedTask?.id}_${index}`}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedImage({ image, type: "before" });
                              setFullScreen(true);
                            }}
                          />
                        )
                      )
                    ) : (
                      <div className="col-span-3 w-full h-56 flex items-center justify-center">
                        <p>No images uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-semibold mb-2 text-center">After</h1>
                <div className="max-h-64 overflow-y-auto bg-gray-200/50 border-2 border-dashed border-gray-400 p-2 rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTask?.image_after &&
                    JSON.parse(selectedTask?.image_after).length > 0 ? (
                      JSON.parse(selectedTask?.image_after).map(
                        (image, index) => (
                          <img
                            key={index}
                            src={`${
                              import.meta.env.VITE_BASE_AFTER_PATH
                            }/${image}`}
                            alt={`before${selectedTask?.id}_${index}`}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedImage({ image, type: "after" });
                              setFullScreen(true);
                            }}
                          />
                        )
                      )
                    ) : (
                      <div className="col-span-3 w-full h-56 flex items-center justify-center">
                        <p>No images uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              // onClick={() => handleDelete(selectDevice?.device_id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </ModalPopup>
      <ModalPopup
        isOpen={isFullScreen}
        onClose={() => setFullScreen(false)}
        title={
          selectedImage?.type === "before" ? "Before Image" : "After Image"
        }
      >
        <div className="w-full h-full">
          <img
            src={`${
              selectedImage?.type == "before"
                ? `${import.meta.env.VITE_BASE_BEFORE_PATH}/${
                    selectedImage?.image
                  }`
                : `${import.meta.env.VITE_BASE_AFTER_PATH}/${
                    selectedImage?.image
                  }`
            }`}
            alt="Full Screen"
            className="w-full h-full object-cover"
          />
        </div>
      </ModalPopup>
    </div>
  );
};

export default RepairWork;
