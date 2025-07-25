import React from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Pencil, Search, Trash } from "lucide-react";

dayjs.extend(duration);

const formatDuration = (start, end) => {
  const s = dayjs(start);
  const e = end ? dayjs(end) : dayjs();
  const diff = dayjs.duration(e.diff(s));
  const hours = String(diff.hours()).padStart(2, "0");
  const minutes = String(diff.minutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const Table = ({ floor, rooms }) => {
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
              <th className="px-4 py-2 w-[10%]">IN</th>
              <th className="px-4 py-2 w-[10%]">OUT</th>
              <th className="px-4 py-2 w-[10%]">DURATION</th>
              <th className="px-4 py-2 w-[50%]">FAULT</th>
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
                    {showTimeIn ? dayjs(created_at).format("HH:mm") : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {showTimeOut && ended_at
                      ? dayjs(ended_at).format("HH:mm")
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {showDuration
                      ? formatDuration(
                          created_at,
                          showTimeOut ? ended_at : null
                        )
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{problem_description}</td>

                  <td className="px-4 py-2 space-x-1">
                    <button className="p-1 hover:bg-blue-200 rounded-full cursor-pointer">
                      <Search className="w-4 h-4 text-blue-500" />
                    </button>
                    {/* <button className="p-1 hover:bg-yellow-200 rounded-full cursor-pointer">
                      <Pencil className="w-4 h-4 text-yellow-500" />
                    </button>
                    <button className="p-1 hover:bg-red-200 rounded-full cursor-pointer">
                      <Trash className="w-4 h-4 text-red-500" />
                    </button> */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
