import React, { useState, useRef } from "react";
import classNames from "classnames";
import { Outlet } from "react-router-dom";
import useViewportHeight from "@/hooks/useViewportHeight";
import Navbar from "@/components/shared/Navbar";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import PageHeader from "@/components/ui/PageHeader";
import useStore from "@/store/store";

export default function NoneSidebarLayout() {
  useViewportHeight();

  const { user, breadcrumb } = useStore((state) => state);
  const mainRef = useRef(null);

  // -translate-x-full

  return (
    <div className="min-h-[calc(var(--vh)_*_100)] w-full bg-gray1 text-black relative">
      {/* <div
        className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-gray1 shadow-xl transform transition-transform duration-300 translate-x-0`}
      ></div> */}

      <div className="flex flex-col h-[calc(var(--vh)_*_100)] w-full transition-all duration-300 lg:pl-[0px]">
        <Navbar user={user} />
        <main
          ref={mainRef}
          className={classNames("flex-1 gap-2  overflow-auto p-2 md:p-4 ")}
        >
          <PageHeader segments={breadcrumb} />
          <Outlet />
          <ScrollToTopButton scrollContainerRef={mainRef} />
        </main>
      </div>
    </div>
  );
}
