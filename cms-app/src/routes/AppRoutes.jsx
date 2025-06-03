import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import DashboardTechLead from "@/pages/technicianLead/Dashboard";
import DashboardTech from "@/pages/technician/Dashboard";
import DashboardAdmin from "@/pages/superadmin/Dashboard";
import UserAdmin from "@/pages/superadmin/User";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
    ],
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
      { index: true, element: <DashboardTechLead /> },
      { path: "rooms", element: <Rooms /> },
      { path: "repair", element: <RepairWork /> },
      { path: "history", element: <History /> },
      { path: "setting", element: <Setting /> },
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
    children: [{ index: true, element: <DashboardTech /> }],
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
