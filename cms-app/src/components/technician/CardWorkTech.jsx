import React from "react";
import ModalPopup from "@/components/ui/ModalPopup";
import dayjs from "dayjs";
import { Pencil, Search, Trash } from "lucide-react";
import { nameStatusId, colorBadge } from "@/utilities/helpers";
import { maintenance_status } from "@/constant/common";

const CardWorkTech = ({ task, onView, onEdit, onDelete }) => {
  return (
    <div className="w-full h-[100px] bg-white shadow-2xl p-0 rounded-lg space-y-4  ">
      {/* header */}
      <div className="w-full h-full flex items-start justify-center gap-2">
        <div className="flex-1 h-full flex items-center gap-0">
          <div className="flex-1 h-full flex items-center justify-center p-4 rounded-l-lg">
            <h4 className="font-semibold text-xl text-white">
              {task?.floor}
              {task?.room_number}
            </h4>
          </div>
          <div className="w-full h-full flex items-start justify-between gap-2 p-4">
            <div className="w-full h-full flex flex-col items-start justify-center">
              <h1 className="font-semibold">GUEST-OUT, DND</h1>
              <p className="text-sm break-words line-clamp-2">
                {task?.problem_description || "No description provided."}
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Voluptates laboriosam facere dolorem consectetur quis nihil
                magnam maxime laborum veniam assumenda quidem placeat voluptate
                architecto, distinctio officia ducimus odit! Dolore, excepturi.
              </p>
            </div>
            <div className="h-full flex flex-col items-center justify-center">
              <button
                //   onClick={() => {
                //     onSelect(task);
                //     onView();
                //   }}
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
