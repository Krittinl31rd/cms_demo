import React from "react";
import { LogOut, PanelLeftClose } from "lucide-react";
import { sidebarItems } from "@/constant/sidebarItems";
import { role_id_to_name } from "@/constant/common.js";
import { NavLink } from "react-router-dom";

const Sidebar = ({ user, toggleSidebar }) => {
  const items = sidebarItems[user?.role_id] || [];
  return (
    <div className="h-full w-full flex flex-col gap-2 bg-gray1 p-4 overflow-y-auto">
      {/* Header */}
      <div className="h-[48px] flex items-center">
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex items-center justify-center text-primary cursor-pointer"
        >
          <PanelLeftClose />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{role_id_to_name[user?.role_id]}</h1>
        {items.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            {...(index === 0 ? { end: true } : {})}
            className={({ isActive }) =>
              isActive
                ? "flex items-center bg-primary text-white text-lg rounded-xl px-4 py-3 gap-2"
                : "flex items-center bg-gray1 text-black text-lg rounded-xl px-4 py-3 gap-2 hover:bg-primary hover:text-white"
            }
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
