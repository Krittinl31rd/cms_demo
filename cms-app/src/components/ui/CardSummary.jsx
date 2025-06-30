import React from "react";

const CardSummary = ({
  title = "Online",
  value = 100,
  icon: Icon = null,
  iconColor = "text-green-500",
  borderColor = "border-green-500",
}) => {
  return (
    <div
      className={`w-full h-[100px] bg-white ${borderColor} border-l-4 rounded-xl shadow-xl p-4 flex flex-row items-center justify-center`}
    >
      <div className="flex-1">
        <h6 className="text-gray-500 font-semibold">{title}</h6>
        <h6 className="text-3xl text-black font-semibold">{value}</h6>
      </div>
      {Icon && <Icon size={48} className={iconColor} />}
    </div>
  );
};

export default CardSummary;
