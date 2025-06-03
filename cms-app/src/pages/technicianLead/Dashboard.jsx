import React, { useState } from "react";
import dayjs from "dayjs";
import {
  NotepadText,
  CircleCheck,
  Loader,
  UserPlus,
  Globe,
} from "lucide-react";
import CardSummary from "@/components/ui/CardSummary";
import DataTable from "@/components/table/DataTable";
import ModalPopup from "@/components/ui/ModalPopup";
import { data, dataDashboard } from "@/constant/data";
const stats = data.stats;
const repairs = data.repairs;

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  const handleOpenModal = (row) => {
    setSelectedRepair(row);
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: "Assigned At",
      accessor: "assignedAt",
      cell: (row) =>
        row.assignedAt ? (
          dayjs(row.assignedAt).format("DD/MM/YYYY HH.mm")
        ) : (
          <span className="text-red-500">Not assigned</span>
        ),
    },
    {
      header: "Started At",
      accessor: "startedAt",
      cell: (row) =>
        row.startedAt ? (
          dayjs(row.assignedAt).format("DD/MM/YYYY HH.mm")
        ) : (
          <span className="text-red-500">Not started</span>
        ),
    },
    {
      header: "Room",
      accessor: "roomName",
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row) => <p className="w-28 truncate">{row.description}</p>,
    },
    {
      header: "Technician",
      accessor: "technician",
      cell: (row) =>
        row.technician || (
          <div className="flex items-center gap-2">
            <span className="text-red-500">Unassigned</span>
            <button className="px-2 py-1 rounded-full text-sm bg-primary text-white cursor-pointer">
              <UserPlus size={14} />
            </button>
          </div>
        ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const statusColor = {
          new: "bg-gray-200 text-gray-800",
          pending: "bg-yellow-200 text-yellow-800",
          in_progress: "bg-blue-200 text-blue-800",
        };
        const statusLabel = {
          new: "Requests",
          pending: "Pending",
          in_progress: "In Progress",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              statusColor[row.status] || "bg-gray-200 text-gray-800"
            }`}
          >
            {statusLabel[row.status]}
          </span>
        );
      },
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row) => (
        <button
          onClick={() => handleOpenModal(row)}
          className="text-primary hover:underline"
        >
          Details
        </button>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Room</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <CardSummary
          title="Online"
          value={stats.onlineRooms}
          icon={Globe}
          iconColor="text-green-500"
        />
        <CardSummary
          title="Offline"
          value={stats.offlineRooms}
          icon={Globe}
          iconColor="text-red-500"
        />
      </div>
      <h1 className="text-2xl font-semibold">Repair Work</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        <CardSummary
          title="Repair Requests"
          value={stats.new}
          icon={NotepadText}
          iconColor="text-gray-500"
        />
        <CardSummary
          title="Pending"
          value={stats.pending}
          icon={CircleCheck}
          iconColor="text-yellow-500"
        />
        <CardSummary
          title="In Progress"
          value={stats.in_progress}
          icon={Loader}
          iconColor="text-blue-500"
        />
      </div>

      <DataTable columns={columns} data={repairs} />

      <ModalPopup
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Repair Details - ${selectedRepair?.roomName || ""}`}
      >
        {selectedRepair ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>ID:</strong> {selectedRepair.id}
            </p>
            <p>
              <strong>Room ID:</strong> {selectedRepair.roomId}
            </p>
            <p className="truncate">
              <strong>Description:</strong> {selectedRepair.description}
            </p>
            <p>
              <strong>Technician:</strong>{" "}
              {selectedRepair.technician || "Unassigned"}
            </p>
            <p>
              <strong>Status:</strong> {selectedRepair.status}
            </p>
            <p>
              <strong>Assigned At:</strong>{" "}
              {selectedRepair.assignedAt
                ? dayjs(selectedRepair.assignedAt).format("DD/MM/YYYY HH.mm")
                : "Not assigned"}
            </p>
            <p>
              <strong>Started At:</strong>{" "}
              {selectedRepair.startedAt
                ? dayjs(selectedRepair.startedAt).format("DD/MM/YYYY HH.mm")
                : "Not started"}
            </p>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </ModalPopup>
    </div>
  );
};

export default Dashboard;
