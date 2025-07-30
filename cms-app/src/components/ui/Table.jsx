import React, { useEffect, useState, useMemo, useRef } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Pencil, Search, Trash } from "lucide-react";
import DetailWork from "@/components/technician/DetailWork";
import ModalPopup from "@/components/ui/ModalPopup";
dayjs.extend(duration);

const formatDuration = (start, end) => {
  const s = dayjs(start);
  const e = end ? dayjs(end) : dayjs();
  const diff = dayjs.duration(e.diff(s));
  const hours = String(Math.floor(diff.asHours())).padStart(2, "0");
  const minutes = String(diff.minutes()).padStart(2, "0");
  const seconds = String(diff.seconds()).padStart(2, "0");
  return `${hours}:${minutes}.${seconds}`;
};

const Table = ({ floor, rooms }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewTask, setViewTask] = useState(false);
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 bg-white px-4 py-2 rounded-lg shadow">
        Floor {floor}
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white rounded-xl shadow overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="px-4 py-2 w-[10%]">ROOM #</th>
              <th className="px-4 py-2 w-[15%]">CREATED</th>
              <th className="px-4 py-2 w-[10%]">IN</th>
              <th className="px-4 py-2 w-[10%]">OUT</th>
              <th className="px-4 py-2 w-[10%]">DURATION</th>
              <th className="px-4 py-2 w-[35%]">FAULT</th>
              <th className="px-4 py-2 w-[10%]"></th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => {
              const {
                id,
                room_number,
                created_at,
                ended_at,
                status_id,
                started_at,
                problem_description,
              } = room;

              const showTimeIn =
                status_id == 3 || status_id == 4 || status_id == 5;
              const showTimeOut = status_id == 4 || status_id == 5;
              const showDuration = showTimeIn || showTimeOut;

              return (
                <tr
                  key={id}
                  className="border-t border-gray-300 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{room_number}</td>
                  <td className="px-4 py-2">
                    {created_at
                      ? dayjs(created_at).format("DD/MM/YY HH:mm")
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {showTimeIn ? dayjs(started_at).format("HH:mm") : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {showTimeOut && ended_at
                      ? dayjs(ended_at).format("HH:mm")
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {showDuration
                      ? formatDuration(
                          started_at,
                          showTimeOut ? ended_at : null
                        )
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{problem_description}</td>

                  <td className="px-4 py-2 space-x-1">
                    <button
                      onClick={() => {
                        setSelectedTask(room);
                        setViewTask(true);
                      }}
                      className="p-1 hover:bg-blue-200 rounded-full cursor-pointer"
                    >
                      <Search className="w-4 h-4 text-blue-500" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ModalPopup
        isOpen={isViewTask}
        onClose={() => setViewTask(false)}
        title={`Work Details Room ${selectedTask?.floor}${selectedTask?.room_number} #${selectedTask?.id} `}
      >
        <DetailWork selectedTask={selectedTask}></DetailWork>
      </ModalPopup>
    </div>
  );
};

export default Table;
