import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import NoneSidebarLayout from "@/layouts/NoneSidebarLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import DashboardFrontDesk from "@/pages/frontdesk/Dashboard";
import DashboardTechLead from "@/pages/technicianLead/Dashboard";
import RoomDevicesLog from "@/pages/technicianLead/RoomDevicesLog";
import DashboardTech from "@/pages/technician/Dashboard";
import Task from "@/pages/technician/Task";
import TaskHistoryTech from "@/pages/technician/History";
import DashboardAdmin from "@/pages/superadmin/Dashboard";
import UserAdmin from "@/pages/superadmin/User";
import RoomAdmin from "@/pages/superadmin/Room";
import RoomIDAdmin from "@/pages/superadmin/RoomID";
import NotFound from "@/pages/NotFound";
import Rooms from "@/pages/technicianLead/Rooms";
import RepairWork from "@/pages/technicianLead/RepairWork";
import History from "@/pages/technicianLead/History";
import User from "@/pages/technicianLead/User";
import Setting from "@/pages/technicianLead/Setting";
import InviteRegister from "@/pages/InviteRegister";
import Register from "@/pages/Register";
import Test from "@/pages/Test";
import ProtectRoute from "@/routes/ProtectRoute";
import { member_role } from "@/constant/common";
import Multiscreen from "../pages/technicianLead/Multiscreen";
import Main from "../pages/technicianLead/Main";
import LayoutV3 from "../layouts/LayoutV3";
import AllRcus from "../pages/technicianLead/v3/AllRcus";
import Fault from "../pages/technicianLead/v3/Fault";
import HiTemp from "../pages/technicianLead/v3/HiTemp";
import WIP from "../pages/technicianLead/v3/WIP";
import Fixed from "../pages/technicianLead/v3/Fixed";
import FaultSum from "../pages/technicianLead/v3/FaultSum";
import AlertSum from "../pages/technicianLead/v3/AlertSum";
import WIPSum from "../pages/technicianLead/v3/WIPSum";
import DoneSum from "../pages/technicianLead/v3/DoneSum";
import NotiSum from "../pages/technicianLead/v3/NotiSum";
import Assign from "../pages/technicianLead/v3/Assign";
import Chart from "../pages/technicianLead/v3/Chart";
import MasterSetting from "../pages/technicianLead/v3/MasterSetting";
import FloorStatusSummary from "../pages/technicianLead/v3/FloorStatusSummary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register/:token",
    element: <Register />,
  },
  {
    path: "/thank-you",
    element: (
      <div className="text-center mt-10 text-2xl">Thank you for applying!</div>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectRoute
        element={MainLayout}
        allowedRoles={[member_role.SUPER_ADMIN]}
      />
    ),
    children: [
      { index: true, element: <DashboardAdmin /> },
      { path: "user", element: <UserAdmin /> },
      { path: "room", element: <RoomAdmin /> },
      { path: "room/:room_id", element: <RoomIDAdmin /> },
      { path: "log", element: <RoomDevicesLog /> },
    ],
  },
  {
    path: "/frontdesk",
    element: (
      <ProtectRoute
        element={NoneSidebarLayout}
        allowedRoles={[member_role.FRONT_DESK]}
        // requiredPermission="VIEW_TECH_PANEL"
      />
    ),
    children: [{ index: true, element: <DashboardFrontDesk /> }],
  },
  {
    path: "/techlead",
    element: (
      <ProtectRoute
        element={MainLayout}
        allowedRoles={[member_role.TECHNICIAN_LEAD]}
        // requiredPermission="VIEW_TECH_PANEL"
      />
    ),
    children: [
      // { index: true, element: <DashboardTechLead /> },
      { path: "rooms", element: <Rooms /> },
      { path: "repair", element: <RepairWork /> },
      { path: "history", element: <History /> },
    ],
  },
  {
    path: "/techlead",
    element: (
      <ProtectRoute
        element={LayoutV3}
        allowedRoles={[member_role.TECHNICIAN_LEAD]}
        // requiredPermission="VIEW_TECH_PANEL"
      />
    ),
    children: [
      { index: true, element: <FloorStatusSummary /> },
      { path: "allrcu", element: <AllRcus /> },
      { path: "fault", element: <Fault /> },
      { path: "hitemp", element: <HiTemp /> },
      { path: "wip", element: <WIP /> },
      { path: "fixed", element: <Fixed /> },
      { path: "faultsum", element: <FaultSum /> },
      { path: "alertsum", element: <AlertSum /> },
      { path: "wipsum", element: <WIPSum /> },
      { path: "donesum", element: <DoneSum /> },
      { path: "notisum", element: <NotiSum /> },
      { path: "assign", element: <Assign /> },
      { path: "chart", element: <Chart /> },
      { path: "configesm", element: <Setting /> },
      { path: "configsence", element: <Multiscreen /> },
      { path: "deviceslogs", element: <RoomDevicesLog /> },
      { path: "configmaster", element: <MasterSetting /> },
    ],
  },
  {
    path: "/tech",
    element: (
      <ProtectRoute
        element={MainLayout}
        allowedRoles={[member_role.TECHNICIAN]}
        // requiredPermission="VIEW_TECH_PANEL"
      />
    ),
    children: [
      { index: true, element: <DashboardTech /> },
      { path: "task", element: <Task /> },
      { path: "task-history", element: <TaskHistoryTech /> },
      { path: "room", element: <Rooms /> },
    ],
  },
  {
    path: "/test",
    element: <Test />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const AppRoutes = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default AppRoutes;
