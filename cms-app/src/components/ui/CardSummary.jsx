import React from "react";
import { Wifi } from "lucide-react";

const CardSummary = ({
  title = "Online",
  value = 100,
  icon: Icon = Wifi,
  iconColor = "text-green-500",
}) => {
  return (
    <div className="w-full h-[100px] bg-white rounded-lg shadow-xl p-4 flex flex-row items-center justify-center">
      <div className="flex-1">
        <h6 className="text-gray-500 font-semibold">{title}</h6>
        <h6 className="text-3xl text-black font-semibold">{value}</h6>
      </div>
      <Icon size={64} className={iconColor} />
    </div>
  );
};

export default CardSummary;
