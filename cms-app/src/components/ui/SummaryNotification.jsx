import React from "react";
import dayjs from "dayjs";
import { AlertTriangle, BrushCleaning, Wrench } from "lucide-react";

// Mapping type_id to label, icon, and color
const TYPE_MAP = {
  1: { label: "ALERT&ALRAM", icon: AlertTriangle, color: "red" },
  2: { label: "Cleaning", icon: BrushCleaning, color: "blue" },
  3: { label: "FAULT", icon: Wrench, color: "green" },
};

const SummaryNotification = ({ data, activeSection }) => {
  // Group and sort data by type_id
  const grouped = data.reduce((acc, item) => {
    const key = item.type_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Sort each group by latest `sent_at`
  Object.values(grouped).forEach((items) => {
    items.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  });

  return (
    <div className="space-y-4 ">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{activeSection?.lable}</h2>
        <p className="text-gray-500 text-sm">
          Total notifications: <strong>{data.length}</strong>
        </p>
      </div>

      {/* Summary by Type */}
      <div className="grid grid-cols-1  gap-4">
        {Object.entries(grouped).map(([typeId, items]) => {
          const { label, icon: Icon, color } = TYPE_MAP[typeId] || {};
          return (
            <div
              key={typeId}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded bg-${color}-50`}>
                  <Icon className={`h-5 w-5 text-${color}-600`} />
                </div>
                <h4 className="text-md font-semibold text-gray-900">
                  {label} ({items.length})
                </h4>
              </div>

              {/* Notification List */}
              <div className="space-y-2 max-h-64 overflow-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-2 px-3 bg-gray-50 rounded shadow-sm"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Room: <strong>{item.room_id}</strong> &middot;{" "}
                      {dayjs(item.sent_at).format("DD MMM YYYY HH:mm:ss")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryNotification;
