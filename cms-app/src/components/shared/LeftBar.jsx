import React, { useEffect, useState, useRef } from "react";
import useStore from "@/store/store";
import { GetSummary } from "@/api/summary";

const color = {
  Total: "bg-gray-300 text-black",
  Online: "bg-green-400 text-black",
  Offline: "bg-black text-white",
  Fault: "bg-red-400 text-white",
  "HI-Temp": "bg-orange-400 text-white",
  WIP: "bg-yellow-400 text-white",
  Fixed: "bg-blue-400 text-white",
};

const LeftBar = () => {
  const { token, summaryData, getSummary } = useStore();

  const fetchSummary = async () => {
    try {
      await getSummary(token);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [token]);

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-2 overflow-y-auto">
      <div className="h-full flex flex-col gap-2">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className={`flex items-center text-lg rounded-xl px-2 py-3 gap-2 font-semibold ${
              color[item.label]
            }`}
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
