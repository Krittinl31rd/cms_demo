import React, { useEffect, useState, useMemo, useRef } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { taskStatusId, colorBadge } from "@/utilities/helpers";
import ModalPopup from "@/components/ui/ModalPopup";
dayjs.extend(duration);

const formatDuration = (start, end) => {
  const s = dayjs(start);
  const e = end ? dayjs(end) : dayjs();
  const diff = dayjs.duration(e.diff(s));
  const hours = String(Math.floor(diff.asHours())).padStart(2, "0");
  const minutes = String(diff.minutes()).padStart(2, "0");
  const seconds = String(diff.seconds()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const DetailWork = ({ selectedTask }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFullScreen, setFullScreen] = useState(false);

  return (
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
          <div>
            Created at: {""}
            <span className="font-semibold ">
              {selectedTask?.created_at
                ? dayjs(selectedTask?.created_at).format(
                    "DD MMMM YYYY HH:mm:ss"
                  )
                : "Not set"}
            </span>
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
                  ? dayjs(selectedTask.ended_at).format("DD MMMM YYYY HH:mm:ss")
                  : "Not set"}
              </span>
            </div>
            <div>
              Duration: {""}
              <span className="font-semibold ">
                {formatDuration(
                  selectedTask?.started_at,
                  selectedTask?.ended_at
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-full bg-gray-200/50 p-2 rounded-lg space-y-2 max-h-24 overflow-y-auto">
          <h1 className="font-semibold mb-4">Problem Description</h1>
          <p>
            {selectedTask?.problem_description || "No description provided."}
          </p>
        </div>
        <div className="w-full bg-gray-200/50 p-2 rounded-lg space-y-2 max-h-24 overflow-y-auto">
          <h1 className="font-semibold mb-4">Fix Description</h1>
          <p>{selectedTask?.fix_description || "No description provided."}</p>
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
                      src={`${import.meta.env.VITE_BASE_BEFORE_PATH}/${image}`}
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
                      src={`${import.meta.env.VITE_BASE_AFTER_PATH}/${image}`}
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

export default DetailWork;
