import React from "react";

// transition-shadow duration-300 cursor-pointer
const CardWork = ({ task }) => {
  return (
    <div className="w-full bg-white shadow-2xl p-4 rounded-lg  ">
      {/* header */}
      <div className="w-full flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold">
            {task?.assigned_to_name.charAt(0)}
          </span>
          <div className="flex-1">
            <h4 className="font-semibold">{task?.assigned_to_name}</h4>
            <p className="text-sm text-gray-500">ID: #{task?.id}</p>
          </div>
        </div>
        <div className="bg-blue-500/90 text-blue-950 px-4 py-1 rounded-full text-sm font-semibold">
          <span>IN PROGRESS</span>
        </div>
      </div>
      {/* content */}
      {/* footer */}
    </div>
  );
};

export default CardWork;
