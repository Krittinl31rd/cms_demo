import React from "react";
import ModalPopup from "@/components/ui/ModalPopup";
import dayjs from "dayjs";
import { Pencil, Search, Trash } from "lucide-react";
import { colorBadge } from "@/utilities/helpers";
import { maintenance_status } from "@/constant/common";

const CardWorkTech = ({ task, onSelect, onView, onEdit, onDelete }) => {
  return (
    <div
      onClick={() => {
        onSelect(task);
        onView();
      }}
      className="w-full h-[100px] bg-white shadow-2xl p-0 rounded-lg space-y-4 cursor-pointer"
    >
      {/* header */}
      <div className="w-full h-full flex items-start justify-center gap-1">
        <div className="flex-1 h-full flex items-center gap-0">
          <div
            className={`w-[100px] h-full flex items-center justify-center p-4 rounded-l-lg ${
              colorBadge[task?.status_id]
            }`}
          >
            <h4 className="font-semibold text-xl">
              {task?.floor}
              {task?.room_number}
            </h4>
          </div>
          <div className="w-full h-full flex items-start justify-between gap-1 p-4">
            <div className="w-full h-full flex flex-col items-start justify-center">
              <h1 className="font-semibold">
                {task?.guest_status_id == 0 ? "GUEST-OUT" : "GUEST-IN"}
                {task?.dnd_status == 1 && ", DND"}
              </h1>
              <p className="text-sm break-words line-clamp-2 ">
                {task?.problem_description || "No description provided."}
              </p>
              <h1 className="font-semibold text-sm">
                {task?.status_id == maintenance_status.ASSIGNED &&
                  dayjs(task?.created_at).format("DD MMMM YYYY HH:mm:ss")}

                {task?.status_id == maintenance_status.IN_PROGRESS &&
                  dayjs(task?.started_at).format("DD MMMM YYYY HH:mm:ss")}
              </h1>
            </div>
            <div className="h-full flex flex-col items-center justify-center">
              <button
                onClick={() => {
                  onSelect(task);
                  onView();
                }}
                className="flex items-center justify-center  py-2 px-2 hover:bg-gray-300 rounded-full transition-colors duration-300 cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardWorkTech;
