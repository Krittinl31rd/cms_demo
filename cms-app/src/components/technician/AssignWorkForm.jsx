import { useState } from "react";
import dayjs from "dayjs";
import { UserPlus } from "lucide-react";
import { data, dataDashboard } from "@/constant/data";
import DataTable from "@/components/table/DataTable";
import ModalPopup from "@/components/ui/ModalPopup";
import Button from "@/components/ui/Button";
const repairs = data.repairs;

export default function AssignWorkForm({ technicians = [] }) {
  const [isCancel, setIsCancel] = useState(false);
  const [selectCancel, setSelectCancel] = useState(null);
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
      header: "Technician",
      accessor: "technician",
      cell: (row) =>
        row.technician || (
          <div className="flex items-center gap-2">
            <span className="text-red-500">Unassigned</span>
            <button
              onClick={() =>
                setFormData((prev) => ({ ...prev, room: row.roomName }))
              }
              className="px-2 py-1 rounded-full text-sm bg-primary text-white cursor-pointer"
            >
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
          pending: "bg-yellow-200 text-yellow-800",
          in_progress: "bg-blue-200 text-blue-800",
        };
        const statusLabel = {
          pending: "Pending",
          in_progress: "In Progress",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              statusColor[row.status] || "bg-gray-200"
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
          onClick={() => {
            setSelectCancel(row);
            setIsCancel(true);
          }}
          className="text-red-500 hover:underline"
        >
          Cancel
        </button>
      ),
    },
  ];

  const [formData, setFormData] = useState({
    room: "",
    detail: "",
    technicianId: "",
    technician: "",
    status: "pending",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `${formData.room} | ${formData.detail} | [${formData.technicianId}]${formData.technician}`
    );
    setFormData({
      room: "",
      detail: "",
      technicianId: "",
      technician: "",
      status: "pending",
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <DataTable columns={columns} data={repairs} />
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto p-4 bg-white shadow-xl rounded-2xl space-y-4"
      >
        <h2 className="text-xl font-semibold border-gray-300 border-b pb-2">
          Assign Work
        </h2>

        <div>
          <label className="block text-sm font-semibold">Room</label>
          <input
            type="text"
            name="room"
            value={formData.room}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Detail</label>
          <textarea
            name="detail"
            value={formData.detail}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Assign Technician</label>
          <div className="max-h-40 overflow-y-scroll  grid grid-cols-2 md:grid-cols-3 gap-2 pr-2">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    technicianId: tech.id,
                    technician: tech.name,
                  }))
                }
                className={`cursor-pointer p-2 border  rounded-lg shadow-sm transition-all ${
                  formData.technician == tech.name
                    ? "bg-blue-100 border-blue-500"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                }`}
              >
                <div className="w-full flex items-center gap-2">
                  {tech.img ? (
                    <img
                      src={tech.img}
                      alt="tech_avatar"
                      className="w-10 h-10 rounded-full object-contain border border-gray-300"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold">
                      {tech?.name.charAt(0)}
                    </span>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{tech.name}</h4>
                    <p className="text-sm text-gray-500">{tech.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className=" text-black text-sm">
            Selected:{" "}
            <span className="font-semibold">
              {formData.technician
                ? `[${formData.technicianId}]${formData.technician}`
                : ""}
            </span>
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg"
        >
          Submit
        </button>
      </form>

      <ModalPopup
        isOpen={isCancel}
        onClose={() => setIsCancel(false)}
        title={`Are you sure?`}
      >
        {selectCancel ? (
          <div className="space-y-2 text-sm">
            <p>
              Cancle your work {selectCancel.id} | {selectCancel.roomName} |{" "}
              {selectCancel.status}
            </p>
            <div className="w-full flex items-center justify-end gap-2">
              <Button variant="gray" onClick={() => setIsCancel(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert(`Cancel success`);
                  setIsCancel(false);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </ModalPopup>
    </div>
  );
}
