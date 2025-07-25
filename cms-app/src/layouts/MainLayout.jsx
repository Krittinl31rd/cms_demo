import React, { useState, useRef } from "react";
import classNames from "classnames";
import { Outlet } from "react-router-dom";
import useViewportHeight from "@/hooks/useViewportHeight";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import PageHeader from "@/components/ui/PageHeader";
import useStore from "@/store/store";

export default function MainLayout() {
  useViewportHeight();

  const { user, breadcrumb } = useStore((state) => state);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mainRef = useRef(null);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-[calc(var(--vh)_*_100)] w-full bg-gray1 text-black relative overflow-hidden">
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-gray1 shadow-xl transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar user={user} toggleSidebar={handleToggleSidebar} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={handleToggleSidebar}
        />
      )}

      <div className="flex flex-col h-[calc(var(--vh)_*_100)] w-full transition-all duration-300 lg:pl-[0px]">
        <Navbar
          user={user}
          toggleSidebar={handleToggleSidebar}
          isOpen={isSidebarOpen}
        />
        <main
          ref={mainRef}
          className={classNames("flex-1 gap-2  overflow-auto p-4 ", {
            "lg:pl-[276px]": isSidebarOpen,
          })}
        >
          <PageHeader segments={breadcrumb} />
          <Outlet />
          <ScrollToTopButton scrollContainerRef={mainRef} />
        </main>
      </div>
    </div>
  );
}
