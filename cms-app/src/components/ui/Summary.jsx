import React from "react";
import { Building2, DoorClosed, AlertCircle } from "lucide-react";
import { maintenance_status } from "@/constant/common";

const STATUS_GROUPS = {
  "Pending / Assigned": [
    maintenance_status.PENDING,
    maintenance_status.ASSIGNED,
  ],
  "In Progress": [maintenance_status.IN_PROGRESS],
  "Fixed / Unresolved": [
    maintenance_status.FIXED,
    maintenance_status.UNRESOLVED,
  ],
};

// Group by helper
const groupByWithDetail = (data, key, extraKey) =>
  data.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = { count: 0, names: new Set() };
    acc[group].count += 1;
    if (extraKey && item[extraKey]) acc[group].names.add(item[extraKey]);
    return acc;
  }, {});

// ListCard with optional technician
const ListCard = ({ title, data, icon: Icon, color, showTech = false }) => {
  const isEmpty = !data || Object.keys(data).length === 0;
  return (
    <div className="bg-white rounded-2xl p-2 shadow-sm hover:shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded bg-${color}-50`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <h4 className="text-md font-semibold text-gray-900">{title}</h4>
      </div>

      <div className="space-y-2 max-h-64 overflow-auto">
        {isEmpty ? (
          <p className="text-sm text-gray-500 italic text-center">
            No result found
          </p>
        ) : (
          Object.entries(data).map(([label, val]) => (
            <div
              key={label}
              className="flex flex-col justify-between py-1 px-2 bg-gray-50 rounded"
            >
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 font-semibold">
                  {label}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {val.count}
                </span>
              </div>
              {showTech && val.names?.size > 0 && (
                <span className="text-xs text-gray-500 italic">
                  Technician: {[...val.names].join(", ")}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Summary = ({ data, activeSection, setSelectedDate }) => {
  const total = data.length;

  const grouped = Object.entries(STATUS_GROUPS).reduce(
    (acc, [label, statuses]) => {
      const shouldShow =
        (activeSection.type === "wip_sum" && label === "In Progress") ||
        (activeSection.type === "done_sum" && label === "Fixed / Unresolved") ||
        !["wip_sum", "done_sum"].includes(activeSection.type); // default = show all

      if (!shouldShow) return acc;

      const filtered = data.filter((d) => statuses.includes(d.status_id));
      acc[label] = {
        total: filtered.length,
        byFloor: groupByWithDetail(filtered, "floor"),
        byRoom: groupByWithDetail(filtered, "room_number", "assigned_to_name"),
      };
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{activeSection?.lable}</h2>
        <p className="text-gray-500 text-sm">
          Total items <strong>{total}</strong> list
        </p>
      </div>

      <div
        className={
          activeSection.type == "done_sum" || activeSection.type == "wip_sum"
            ? "grid grid-cols-1 gap-4"
            : "grid grid-cols-1 md:grid-cols-3 gap-4"
        }
      >
        {Object.entries(grouped).map(([label, group]) => (
          <ListCard
            key={label}
            title={label}
            data={{ Total: { count: group.total } }}
            icon={AlertCircle}
            color="blue"
          />
        ))}
      </div>

      {/* Tasks by Floor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Tasks by Floor</h3>
        <div
          className={
            activeSection.type == "done_sum" || activeSection.type == "wip_sum"
              ? "grid grid-cols-1 gap-4"
              : "grid grid-cols-1 md:grid-cols-3 gap-4"
          }
        >
          {Object.entries(grouped).map(([label, group]) => (
            <ListCard
              key={label}
              title={label}
              data={group.byFloor}
              icon={Building2}
              color="blue"
            />
          ))}
        </div>
      </div>

      {/* Tasks by Room with Technician */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Tasks by Room</h3>
        <div
          className={
            activeSection.type == "done_sum" || activeSection.type == "wip_sum"
              ? "grid grid-cols-1 gap-4"
              : "grid grid-cols-1 md:grid-cols-3 gap-4"
          }
        >
          {Object.entries(grouped).map(([label, group]) => (
            <ListCard
              key={label}
              title={label}
              data={group.byRoom}
              icon={DoorClosed}
              color="blue"
              showTech
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Summary;
