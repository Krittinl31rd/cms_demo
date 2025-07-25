import React from "react";
import { Building2, DoorClosed, Users, AlertCircle } from "lucide-react";
import { taskStatusId, colorBadgeByLabel } from "@/utilities/helpers";
import { maintenance_status } from "@/constant/common";

const STATUS_ACTIVE = [
  maintenance_status.PENDING,
  maintenance_status.ASSIGNED,
  maintenance_status.IN_PROGRESS,
];
const STATUS_DONE = [maintenance_status.FIXED, maintenance_status.UNRESOLVED];

// Group helper
const groupBy = (data, key) =>
  data.reduce((acc, item) => {
    const group = item[key];
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

const formatLabel = (obj, prefix) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [`${prefix} ${k}`, v])
  );

const Summary = ({ data, activeSection }) => {
  const total = data.length;
  const activeData = data.filter((d) => STATUS_ACTIVE.includes(d.status_id));
  const doneData = data.filter((d) => STATUS_DONE.includes(d.status_id));

  // Summary Groupings
  const groupings = {
    active: {
      floor: formatLabel(groupBy(activeData, "floor"), "Floor"),
      room: formatLabel(groupBy(activeData, "room_number"), "Room"),
      tech: groupBy(activeData, "assigned_to_name"),
    },
    done: {
      floor: formatLabel(groupBy(doneData, "floor"), "Floor"),
      room: formatLabel(groupBy(doneData, "room_number"), "Room"),
      tech: groupBy(doneData, "assigned_to_name"),
    },
  };

  // Reusable Cards
  const ListCard = ({ title, data, icon: Icon, color }) => {
    const isEmpty = !data || Object.keys(data).length === 0;

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md">
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
            Object.entries(data).map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded"
              >
                <span className="text-sm text-gray-700">{label}</span>
                <span className="text-sm font-bold text-gray-900">{count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  //   const StatusCard = ({ data }) => (
  //     <div className="bg-white rounded-2xl  p-4 shadow-sm hover:shadow-md">
  //       <div className="flex items-center gap-2 mb-2">
  //         <div className="p-2 rounded bg-purple-50">
  //           <AlertCircle className="h-5 w-5 text-purple-600" />
  //         </div>
  //         <h4 className="text-md font-semibold text-gray-900">By Status</h4>
  //       </div>
  //       <div className="space-y-2 max-h-64 overflow-auto">
  //         {Object.entries(data).map(([label, count]) => (
  //           <div
  //             key={label}
  //             className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded"
  //           >
  //             <span
  //               className={`px-2 py-1 rounded-full text-xs font-medium ${
  //                 colorBadgeByLabel[label] || "bg-gray-100 text-gray-800"
  //               }`}
  //             >
  //               {label}
  //             </span>
  //             <span className="text-sm font-bold text-gray-900">{count}</span>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{activeSection.lable}</h2>
        <p className="text-gray-500 text-sm">
          Total items <strong>{total}</strong> list
        </p>
      </div>

      {/* Summary Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ListCard
          title="Active Tasks"
          data={{ Total: activeData.length }}
          icon={AlertCircle}
          color="blue"
        />
        <ListCard
          title="Done/Cancelled"
          data={{ Total: doneData.length }}
          icon={AlertCircle}
          color="gray"
        />
        {/* <StatusCard data={groupings.status} /> */}
      </div>

      {/* Detailed Split */}
      <div className="space-y-4">
        {/* By Floor */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Tasks by Floor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListCard
              title="Active"
              data={groupings.active.floor}
              icon={Building2}
              color="blue"
            />
            <ListCard
              title="Done/Cancelled"
              data={groupings.done.floor}
              icon={Building2}
              color="gray"
            />
          </div>
        </div>

        {/* By Room */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Tasks by Room</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListCard
              title="Active"
              data={groupings.active.room}
              icon={DoorClosed}
              color="blue"
            />
            <ListCard
              title="Done/Cancelled"
              data={groupings.done.room}
              icon={DoorClosed}
              color="gray"
            />
          </div>
        </div>

        {/* By Technician */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Tasks by Technician</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListCard
              title="Active"
              data={groupings.active.tech}
              icon={Users}
              color="blue"
            />
            <ListCard
              title="Done/Cancelled"
              data={groupings.done.tech}
              icon={Users}
              color="gray"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
