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
import ModalPopup from "@/components/ui/ModalPopup";
import dayjs from "dayjs";
import { GetMaintenanceTaskByUserID } from "@/api/task";
import { toast } from "react-toastify";
import { maintenance_status } from "@/constant/common";
import { colorBadge } from "@/utilities/helpers";

const Task = () => {
  const { user, token } = useStore((state) => state);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewTask, setViewTask] = useState(false);
  const [taskImages, setTaskImages] = useState({});
  const [fixDescription, setFixDescription] = useState("");

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

  const handleImageChange = (e, key) => {
    const files = Array.from(e.target.files);
    const existingImages = taskImages[key] || [];

    if (existingImages.length + files.length > 5) {
      toast.error("You can upload up to 5 images only.");
      return;
    }

    const filePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setTaskImages((prev) => ({
      ...prev,
      [key]: [...existingImages, ...filePreviews],
    }));
  };

  useEffect(() => {
    return () => {
      Object.values(taskImages)
        .flat()
        .forEach((img) => {
          URL.revokeObjectURL(img.url);
        });
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(taskImages)
        .flat()
        .forEach((img) => {
          URL.revokeObjectURL(img.url);
        });
    };
  }, [viewTask === false]);

  const handleUpdateTask = async ({
    e,
    status_id,
    room_id,
    fix_description,
  }) => {
    e && e.preventDefault();
    if (!selectedTask) {
      toast.error("No task selected.");
      return;
    }

    const beforeImages = taskImages[`before_${selectedTask.id}`] || [];
    const afterImages = taskImages[`after_${selectedTask.id}`] || [];

    if (status_id === maintenance_status.IN_PROGRESS) {
      if (beforeImages.length === 0) {
        toast.error("Please upload at least 1 'before' image.");
        return;
      }
    } else {
      if (afterImages.length === 0) {
        toast.error("Please upload at least 1 'after' image.");
        return;
      }
      if (!fix_description || fix_description.trim() === "") {
        toast.error("Please enter a fix description.");
        return;
      }
    }

    const form = new FormData();
    form.append("room_id", room_id);
    form.append("task_id", selectedTask.id);
    form.append("status_id", status_id);

    if (fix_description) {
      form.append("fix_description", fix_description);
    }

    beforeImages.forEach((img) => {
      form.append("before", img.file);
    });

    if (afterImages.length > 0) {
      afterImages.forEach((img) => {
        form.append("after", img.file);
      });
    }

    try {
      const response = await UpdateTask(token, selectedTask?.id, form);
      toast.success(
        response?.data?.message || "Maintenance task updated successfully."
      );
      fetchTaskList();
      setViewTask(false);
    } catch (err) {
      toast.error(err?.response?.data || "Maintenance task updated failed.");
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
        <div className="space-y-2 text-black">
          <div className="w-full flex items-center gap-2">
            <div
              className={`w-[100px] ${
                colorBadge[selectedTask?.status_id]
              } flex items-center justify-center text-xl font-semibold p-2 rounded-xl`}
            >
              {selectedTask?.floor}
              {selectedTask?.room_number}
            </div>
            <h1 className="font-semibold text-xl">
              {selectedTask?.guest_status_id == 0 ? "GUEST-OUT" : "GUEST-IN"}
              {selectedTask?.dnd_status == 1 && ", DND"}
            </h1>
          </div>
          <div>
            <h1 className="font-semibold">Detail</h1>
            <p className="max-h-20 overflow-auto mr-0.5">
              {selectedTask?.problem_description}
            </p>
          </div>
          {selectedTask?.status_id == maintenance_status.ASSIGNED && (
            <div className="space-y-2">
              {/* Image Previews */}
              {taskImages[`before_${selectedTask.id}`]?.length > 0 && (
                <div className="max-h-64 overflow-y-auto  border-1  border-gray-300 p-2 rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    {taskImages[`before_${selectedTask.id}`].map(
                      (img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img.url}
                            alt={`preview-${index}`}
                            className="cursor-pointer rounded-lg h-32 w-full object-cover"
                          />
                          <button
                            onClick={() =>
                              setTaskImages((prev) => {
                                const key = `before_${selectedTask.id}`;
                                const current = prev[key] || [];
                                const updated = current.filter(
                                  (_, i) => i !== index
                                );

                                // Revoke URL after deletion
                                setTimeout(() => {
                                  if (current[index]?.url)
                                    URL.revokeObjectURL(current[index].url);
                                }, 0);

                                return {
                                  ...prev,
                                  [key]: updated,
                                };
                              })
                            }
                            className="absolute top-0 right-0 p-1 bg-black bg-opacity-50 text-white rounded-bl-md"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <label
                htmlFor="image-upload"
                className="w-full flex items-center justify-center h-24 text-gray-500 border-gray-300 border-2 border-dashed rounded-lg cursor-pointer"
              >
                <Camera size={32} />
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={
                    (taskImages[`before_${selectedTask.id}`]?.length || 0) >= 5
                  }
                  onChange={(e) =>
                    handleImageChange(e, `before_${selectedTask.id}`)
                  }
                />
              </label>
              <button
                onClick={(e) =>
                  handleUpdateTask({
                    e,
                    room_id: selectedTask?.room_id,
                    status_id: maintenance_status.IN_PROGRESS,
                  })
                }
                className="bg-primary text-white font-semibold w-full inline-flex items-center justify-center px-4 py-2 gap-1 text-sm rounded-xl transition cursor-pointer"
              >
                <PlayCircle /> START
              </button>
            </div>
          )}

          {selectedTask?.status_id == maintenance_status.IN_PROGRESS && (
            <div className="space-y-2">
              <div>
                <h1 className="font-semibold">
                  Start at:{" "}
                  {dayjs(selectedTask?.started_at).format(
                    "DD MMMM YYYY HH:mm:ss"
                  )}
                </h1>
                <div className="max-h-64 overflow-y-auto  border-1  border-gray-300 p-2 rounded-lg">
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
                            className="cursor-pointer rounded-lg h-32 w-full object-cover"
                            // onClick={() => {
                            //   setSelectedImage({ image, type: "after" });
                            //   setFullScreen(true);
                            // }}
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

              {/* Image Previews */}
              <div>
                <h1 className="font-semibold">
                  End at:{" "}
                  {selectedTask?.ended_at &&
                    dayjs(selectedTask?.ended_at).format(
                      "DD MMMM YYYY HH:mm:ss"
                    )}
                </h1>
                {taskImages[`after_${selectedTask.id}`]?.length > 0 && (
                  <div className="max-h-64 overflow-y-auto  border-1  border-gray-300 p-2 rounded-lg">
                    <div className="grid grid-cols-3 gap-2">
                      {taskImages[`after_${selectedTask.id}`].map(
                        (img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img.url}
                              alt={`preview-${index}`}
                              className="cursor-pointer rounded-lg h-32 w-full object-cover"
                            />
                            <button
                              onClick={() =>
                                setTaskImages((prev) => {
                                  const key = `after_${selectedTask.id}`;
                                  const current = prev[key] || [];
                                  const updated = current.filter(
                                    (_, i) => i !== index
                                  );

                                  setTimeout(() => {
                                    if (current[index]?.url)
                                      URL.revokeObjectURL(current[index].url);
                                  }, 0);

                                  return {
                                    ...prev,
                                    [key]: updated,
                                  };
                                })
                              }
                              className="absolute top-0 right-0 p-1 bg-black bg-opacity-50 text-white rounded-bl-md"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <label
                htmlFor="image-upload"
                className="w-full flex items-center justify-center h-24 text-gray-500 border-gray-300 border-2 border-dashed rounded-lg cursor-pointer"
              >
                <Camera size={32} />
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={
                    (taskImages[`after_${selectedTask.id}`]?.length || 0) >= 5
                  }
                  onChange={(e) =>
                    handleImageChange(e, `after_${selectedTask.id}`)
                  }
                />
              </label>
              <div>
                <h1 className="font-semibold">Fix description</h1>
                <textarea
                  value={fixDescription}
                  onChange={(e) => setFixDescription(e.target.value)}
                  placeholder="Enter fix description..."
                  rows={3}
                  className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={(e) =>
                  handleUpdateTask({
                    e,
                    room_id: selectedTask?.room_id,
                    status_id: maintenance_status.FIXED,
                    fix_description: fixDescription,
                  })
                }
                className="bg-green-500 text-white font-semibold w-full inline-flex items-center justify-center px-4 py-2 gap-1 text-sm rounded-xl transition cursor-pointer"
              >
                <CheckCircle /> COMPLETE
              </button>
              <button
                onClick={(e) =>
                  handleUpdateTask({
                    e,
                    room_id: selectedTask?.room_id,
                    status_id: maintenance_status.FIXED,
                    fix_description: fixDescription,
                  })
                }
                className="bg-red-500 text-white font-semibold w-full inline-flex items-center justify-center px-4 py-2 gap-1 text-sm rounded-xl transition cursor-pointer"
              >
                <XCircle /> UNRESOLVED
              </button>
            </div>
          )}
        </div>
      </ModalPopup>
    </>
  );
};

export default Task;
