import { useState } from "react";
import Invitation from "@/components/superadmin/Invitation";
import UserPending from "@/components/superadmin/UserPending";
import AllUsers from "@/components/superadmin/AllUsers";
import classNames from "classnames";

const tabs = [
  { label: "Invitation Links", component: <Invitation /> },
  { label: "Pending Users", component: <UserPending /> },
  { label: "All Users", component: <AllUsers /> },
];

const User = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState(null);

  return (
    <div className="flex flex-col gap-2">
      {/* Tabs for desktop */}
      <div className="hidden md:flex space-x-2 border-b border-gray-300 mb-2">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 -mb-px border-b-2 transition ${
              activeTab === i
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-gray-600 hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content for desktop */}
      <div className="hidden md:block">{tabs[activeTab].component}</div>

      {/* Accordion for mobile */}
      <div className="md:hidden space-y-2">
        {tabs.map((tab, i) => (
          <div key={i} className="">
            <button
              onClick={() => setAccordionOpen(accordionOpen == i ? null : i)}
              className={`w-full px-3 py-2 text-left font-medium bg-white hover:bg-gray-200 transition shadow-xl ${
                accordionOpen == i ? "rounded-t-xl" : "rounded-xl"
              }`}
            >
              {tab.label}
            </button>
            {accordionOpen == i && (
              <div className="p-4 bg-white rounded-b-xl">{tab.component}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default User;
