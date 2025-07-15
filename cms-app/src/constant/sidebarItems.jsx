import {
  LayoutDashboard,
  House,
  TriangleAlert,
  Hammer,
  History,
  Users,
  Settings,
  NotepadText,
} from "lucide-react";
import { member_role } from "./common";

export const sidebarItems = {
  [member_role.SUPER_ADMIN]: [
    // { label: "Dashboard", path: "/admin", icon: <LayoutDashboard /> },
    { label: "User", path: "/admin/user", icon: <Users /> },
    { label: "Rooms", path: "/admin/room", icon: <House /> },
    {
      label: "Log",
      path: "/techlead/log",
      icon: <NotepadText />,
    },
  ],
  [member_role.FRONT_DESK]: [
    { label: "Dashboard", path: "/frontdesk", icon: <LayoutDashboard /> },
  ],
  [member_role.TECHNICIAN_LEAD]: [
    // { label: "Dashboard", path: "/techlead", icon: <LayoutDashboard /> },
    { label: "Rooms", path: "/techlead/rooms", icon: <House /> },
    // { label: "Warn", path: "/techlead/warn", icon: <TriangleAlert /> },
    {
      label: "Repair work",
      path: "/techlead/repair",
      icon: <Hammer />,
    },
    // {
    //   label: "History",
    //   path: "/techlead/history",
    //   icon: <History />,
    // },
    {
      label: "Config",
      path: "/techlead/config",
      icon: <Settings />,
    },
    {
      label: "Log",
      path: "/techlead/log",
      icon: <NotepadText />,
    },
  ],
  [member_role.TECHNICIAN]: [
    { label: "Dashboard", path: "/tech", icon: <LayoutDashboard /> },
    { label: "Task", path: "/tech/task", icon: <NotepadText /> },
    { label: "History", path: "/tech/task-history", icon: <History /> },
    { label: "Room", path: "/tech/room", icon: <House /> },
  ],
};
