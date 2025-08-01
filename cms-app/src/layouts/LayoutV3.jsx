import React, { useRef } from "react";
import classNames from "classnames";
import { Outlet } from "react-router-dom";
import useViewportHeight from "@/hooks/useViewportHeight";
import Navbar from "@/components/shared/Navbar";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import PageHeader from "@/components/ui/PageHeader";
import useStore from "@/store/store";
import RightBar from "@/components/shared/RightBar";
import TopMenuBar from "@/components/shared/TopMenuBar";
import LeftBar from "../components/shared/Leftbar";

export default function LayoutV3() {
  useViewportHeight();

  const { user, breadcrumb } = useStore((state) => state);
  const mainRef = useRef(null);

  return (
    <div className="min-h-[calc(var(--vh)_*_100)] w-full bg-gray1 text-black relative">
      {/* Topbar */}
      <TopMenuBar user={user} />

      {/* Main layout area (Leftbar, Main Content, Rightbar) */}
      <div className="flex pt-16 h-[calc(var(--vh)_*_100-0rem)]">
        {/* Leftbar */}
        <LeftBar />

        {/* Main content */}
        <main
          ref={mainRef}
          className={classNames(
            "flex-1 overflow-y-auto p-2 bg-gray-50 relative"
          )}
        >
          <PageHeader title="Dashboard" breadcrumb={breadcrumb} />
          <Outlet />
          <ScrollToTopButton scrollContainerRef={mainRef} />
        </main>

        {/* Rightbar */}
        <RightBar />
      </div>
      {/* Bottombar */}
      {/* <footer className="w-full h-16 bg-white  fixed bottom-0 left-0 right-0 flex items-center justify-center text-sm z-40 border-t border-gray-200">
        © 2025 Archi-tronic :)
      </footer> */}
    </div>
  );
}
