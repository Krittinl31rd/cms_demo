import React from "react";

const summaryItems = [
  { label: "Total", value: 0, bg: "bg-gray-300 text-black" },
  { label: "Online", value: 9999, bg: "bg-green-400 text-black" },
  { label: "Offline", value: 0, bg: "bg-black text-white" },
  { label: "Fault", value: 0, bg: "bg-red-400 text-white" },
  { label: "HI-Temp", value: 0, bg: "bg-orange-400 text-white" },
  { label: "WIP", value: 0, bg: "bg-yellow-400 text-white" },
  { label: "FIXED", value: 0, bg: "bg-blue-400 text-white" },
];

const LeftBar = () => {
  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-2 overflow-y-auto">
      <div className="h-full flex flex-col gap-2">
        {summaryItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center text-lg rounded-xl px-2 py-3 gap-2 font-semibold ${item.bg}`}
          >
            {item.label}
            <span className="ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default LeftBar;
