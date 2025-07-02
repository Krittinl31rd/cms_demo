import { useState } from "react";
import dayjs from "dayjs";
import { UserPlus } from "lucide-react";
import { data, dataDashboard } from "@/constant/data";
import DataTable from "@/components/table/DataTable";
import ModalPopup from "@/components/ui/ModalPopup";
import Button from "@/components/ui/Button";
import { maintenance_status } from "@/constant/common";
import { CheckRoleName, CheckTypeTechnician } from "@/utilities/helpers";

export default function AssignWorkForm({ technicianList }) {
  const [isCancel, setIsCancel] = useState(false);
  const [selectCancel, setSelectCancel] = useState(null);

  const [formData, setFormData] = useState({
    room_id: "",
    problem_description: "",
    assigned_to: "",
    status_id: maintenance_status.ASSIGNED,
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
    console.log(formData);
    setFormData({
      room_id: "",
      problem_description: "",
      assigned_to: "",
      status_id: maintenance_status.ASSIGNED,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full mx-auto space-y-4">
        <div>
          <label className="block text-sm font-semibold">Room</label>
          <input
            type="text"
            name="room_id"
            value={formData.room}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">
            Problem Description
          </label>
          <textarea
            name="problem_description"
            value={formData.problem_description}
            onChange={handleChange}
            rows="3"
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">
            Assign Technician
          </label>
          <div className="max-h-48 overflow-y-auto  grid grid-cols-2 md:grid-cols-3 gap-2 pr-2">
            {technicianList.map((tech) => (
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
                  formData.technician == tech.id
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
                      {tech?.full_name.charAt(0)}
                    </span>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{tech.full_name}</h4>
                    <p className="text-xs">
                      {CheckTypeTechnician(tech?.type_id)}{" "}
                      {CheckRoleName(tech?.role_id)}
                    </p>
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

        <div className="w-full flex items-center justify-end gap-2">
          <Button type="button" variant="gray">
            Cancel
          </Button>
          <Button>Aassign Work</Button>
        </div>
      </form>

      {/* <ModalPopup
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
      </ModalPopup> */}
    </>
  );
}
