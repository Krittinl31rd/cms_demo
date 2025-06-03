import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import DataTable from "@/components/table/DataTable";
import ModalPopup from "@/components/ui/ModalPopup";
import CalendarPicker from "@/components/ui/CalendarPicker";
import Button from "@/components/ui/Button";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { data } from "@/constant/data";
const repairHistory = data.repairHistory.sort(
  (a, b) => new Date(b.date) - new Date(a.date)
);

const History = () => {
  const [isHistoryOpen, setIsHistory] = useState(false);
  const [selectHistory, setSelectHistory] = useState({});
  const [date, setDate] = useState(null);
  const [range, setRange] = useState({ startDate: null, endDate: null });
  const columns = [
    // {
    //   header: "No.",
    //   accessor: "no",
    //   cell: (_, rowIndex, currentPage, rowsPerPage) =>
    //     (currentPage - 1) * rowsPerPage + rowIndex + 1,
    // },
    {
      header: "Room",
      accessor: "roomName",
    },
    {
      header: "Date",
      accessor: "date",
      cell: (row) => {
        return dayjs(row.date).format("DD/MM/YYYY HH.mm");
      },
    },
    {
      header: "Technician",
      accessor: "technician",
    },
    {
      header: "Duration",
      accessor: "durationMinutes",
      cell: (row) => {
        const hours = Math.floor(row.durationMinutes / 60);
        const mins = row.durationMinutes % 60;
        return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
          2,
          "0"
        )}`;
      },
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row) => (
        <button
          onClick={() => {
            setSelectHistory(row);
            setIsHistory(true);
          }}
          className="text-primary hover:underline"
        >
          Details
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full grid grid-cols-2 gap-2 bg-white rounded-xl shadow-xl p-4">
        <div className="col-span-2 w-full flex items-center gap-2">
          <h1 className="text-sm">Date</h1>
          <div className="w-full max-w-xs">
            <DateRangePicker onRangeSelect={setRange} />
          </div>
          <p>{/* {range?.startDate} - {range?.endDate} */}</p>
        </div>
        <div className="w-full grid items-center gap-2">
          <input
            type="text"
            placeholder="Enter search term"
            // value={""}
            // onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Enter search term"
            // value={""}
            // onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full grid items-center gap-2">
          <input
            type="text"
            placeholder="Enter search term"
            // value={""}
            // onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <Button>Search</Button>
          </div>
        </div>
      </div>
      <DataTable columns={columns} data={repairHistory} enableSearch={false} />
      <ModalPopup
        isOpen={isHistoryOpen}
        onClose={() => setIsHistory(false)}
        title={`${selectHistory.id}`}
      >
        <div className="space-y-2 text-sm">
          <p>
            <strong>ID:</strong> {selectHistory?.id}
          </p>
          <p>
            <strong>Room:</strong> [{selectHistory?.roomId}]{" "}
            {selectHistory.roomName}
          </p>
          <p>
            <strong>Date:</strong>
            {dayjs(selectHistory?.date).format("DD/MM/YYYY HH.mm")}
          </p>
          <p>
            <strong>Technician:</strong> {selectHistory?.technician}
          </p>
          <p>
            <strong>Duration:</strong>{" "}
            {(() => {
              const hours = Math.floor(selectHistory?.durationMinutes / 60);
              const mins = selectHistory?.durationMinutes % 60;
              return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
                2,
                "0"
              )}`;
            })()}
          </p>
          <p>
            <strong>Description:</strong> {selectHistory?.description}
          </p>
          <div className="w-full flex flex-wrap gap-2">
            {selectHistory?.images?.length > 0 ? (
              <>
                {selectHistory?.images?.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Attached ${idx + 1}`}
                    className="w-full max-h-64 max-w-64 rounded"
                  />
                ))}
              </>
            ) : (
              <p>No images attached.</p>
            )}
          </div>
        </div>
      </ModalPopup>
    </div>
  );
};

export default History;
