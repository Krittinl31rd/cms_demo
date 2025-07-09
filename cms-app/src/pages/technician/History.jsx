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

const History = () => {
  const { token, user } = useStore((state) => state);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewTask, setViewTask] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
                  <span>{taskStatusId[selectedTask?.status_id]}</span>
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
                <div className="h-64 overflow-y-auto bg-gray-200/50 border-2 border-dashed border-gray-400 p-2 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTask?.image_before &&
                    selectedTask?.image_before.length > 0 ? (
                      selectedTask?.image_before.map((image, index) => (
                        <img
                          key={index}
                          src={`${
                            import.meta.env.VITE_BASE_BEFORE_PATH
                          }/${image}`}
                          alt={`before${selectedTask?.id}_${index}`}
                          className="cursor-pointer rounded-lg h-32 w-full object-cover"
                          onClick={() => {
                            setSelectedImage({ image, type: "before" });
                            setFullScreen(true);
                          }}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 w-full h-56 flex items-center justify-center">
                        <p>No images uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-semibold mb-2 text-center">After</h1>
                <div className="h-64 overflow-y-auto bg-gray-200/50 border-2 border-dashed border-gray-400 p-2 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTask?.image_after &&
                    selectedTask?.image_after.length > 0 ? (
                      selectedTask?.image_after.map((image, index) => (
                        <img
                          key={index}
                          src={`${
                            import.meta.env.VITE_BASE_AFTER_PATH
                          }/${image}`}
                          alt={`before${selectedTask?.id}_${index}`}
                          className="cursor-pointer rounded-lg h-32 w-full object-cover"
                          onClick={() => {
                            setSelectedImage({ image, type: "after" });
                            setFullScreen(true);
                          }}
                        />
                      ))
                    ) : (
                      <div className="col-span-2 w-full h-56 flex items-center justify-center">
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
    </>
  );
};

export default History;
