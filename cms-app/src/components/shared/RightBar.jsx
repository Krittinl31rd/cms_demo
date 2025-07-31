import React from "react";
import {
  LogOut,
  PanelLeftClose,
  Users,
  AlertCircle,
  Thermometer,
  Wrench,
  CheckCircle2,
  FileText,
  Bell,
  ClipboardList,
  CheckCheck,
  BellRing,
  Share2,
  BarChart2,
  Settings,
  Sliders,
  FileCode,
  House,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const rightBarItems = [
  { label: "All RCU", path: "/techlead", icon: House },
  { label: "Fault", path: "/techlead/fault", icon: AlertCircle },
  { label: "Hi-Temp", path: "/techlead/hitemp", icon: Thermometer },
  { label: "WIP", path: "/techlead/wip", icon: Wrench },
  { label: "Fixed", path: "/techlead/fixed", icon: CheckCircle2 },
  { label: "Fault Sum", path: "/techlead/faultsum", icon: FileText },
  { label: "Alert Sum", path: "/techlead/alertsum", icon: Bell },
  { label: "WIP Sum", path: "/techlead/wipsum", icon: ClipboardList },
  { label: "Done Sum", path: "/techlead/donesum", icon: CheckCheck },
  { label: "Noti Sum", path: "/techlead/notisum", icon: BellRing },
  { label: "Assign", path: "/techlead/assign", icon: Share2 },
  { label: "Chart", path: "/techlead/chart", icon: BarChart2 },
  { label: "ESM Config", path: "/techlead/configesm", icon: Settings },
  { label: "Scene Config", path: "/techlead/configsence", icon: Sliders },
  { label: "Devices Logs", path: "/techlead/deviceslogs", icon: FileCode },
];

const RightBar = () => {
  return (
    <aside className="hidden xl:block w-64 bg-white border-l border-gray-200 p-2 overflow-y-auto">
      {/* <h2 className="font-semibold mb-2">Function</h2> */}
      <div className="h-full flex flex-col gap-2">
        {rightBarItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            {...(index === 0 ? { end: true } : {})}
            className={({ isActive }) =>
              isActive
                ? "flex items-center bg-primary text-white text-lg rounded-xl px-2 py-2 gap-2"
                : "flex items-center text-black text-lg rounded-xl px-2 py-2 gap-2 hover:bg-primary hover:text-white"
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default RightBar;
