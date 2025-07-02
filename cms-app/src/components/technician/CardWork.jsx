import React from "react";
import ModalPopup from "@/components/ui/ModalPopup";
import dayjs from "dayjs";
import { Pencil, Search, Trash } from "lucide-react";
import { nameStatusId, colorBadge } from "@/utilities/helpers";

const CardWork = ({ task, onSelect, onView, onEdit, onDelete }) => {
  const date = dayjs(task?.created_at);

  return (
    <div className="w-full bg-white shadow-2xl p-4 rounded-lg space-y-4  ">
      {/* header */}
      <div className="w-full flex items-start justify-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold">
            {task?.assigned_to_name.charAt(0)}
          </span>
          <div className="flex-1">
            <h4 className="font-semibold">
              Room: {task?.floor}
              {task?.room_number}
            </h4>
            <p className="text-sm">{task?.assigned_to_name}</p>
          </div>
        </div>
        <div
          className={`px-4 py-1 rounded-full text-sm font-semibold ${
            colorBadge[task?.status_id]
          }`}
        >
          <span>{nameStatusId[task?.status_id]}</span>
        </div>
      </div>
      {/* content */}
      <div className="w-full space-y-2">
        <div className="w-full -space-y-1">
          <h1 className="font-semibold">Problem:</h1>
          <p className="text-sm truncate ">
            {task?.problem_description || "No description provided."}
          </p>
        </div>
        <div className="w-full md:flex md:items-center md:justify-between text-sm text-gray-600">
          <h3>
            By: {task?.created_by_name ? task?.created_by_name : "System"}
          </h3>

          <h3>{date ? date.format("DD MMMM YYYY HH:mm:ss") : "Not set"}</h3>
        </div>
      </div>
      {/* footer */}
      <div className="w-full flex items-center justify-center gap-2">
        <button
          onClick={() => {
            onSelect(task);
            onView();
          }}
          className="w-full flex items-center justify-center gap-1 bg-blue-300/80 hover:bg-blue-500 text-blue-950 font-semibold text-sm py-2 px-4 rounded-lg transition-colors duration-300 cursor-pointer"
        >
          <Search size={16} />
          View
        </button>
        <button
          onClick={() => {
            onSelect(task);
            onEdit();
          }}
          className="w-full flex items-center justify-center gap-1 bg-yellow-300/80 hover:bg-yellow-500 text-yellow-950 font-semibold text-sm py-2 px-4 rounded-lg transition-colors duration-300 cursor-pointer"
        >
          <Pencil size={16} />
          Edit
        </button>
        <button
          onClick={() => {
            onSelect(task);
            onDelete();
          }}
          className="w-full flex items-center justify-center gap-1 bg-red-300/80 hover:bg-red-500 text-red-950 font-semibold text-sm py-2 px-4 rounded-lg transition-colors duration-300 cursor-pointer"
        >
          <Trash size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default CardWork;
