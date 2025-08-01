import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { UserPlus } from "lucide-react";
import ModalPopup from "@/components/ui/ModalPopup";
import Button from "@/components/ui/Button";
import { maintenance_status } from "@/constant/common";
import { CheckRoleName, CheckTypeTechnician } from "@/utilities/helpers";
import { toast } from "react-toastify";
import { CreateTask } from "@/api/task";
import useStore from "@/store/store";

export default function AssignWorkForm({
  // fetchTaskList,
  onAssign = null,
  technicianList,
  rooms,
}) {
  const { token } = useStore((state) => state);
  const [isCancel, setIsCancel] = useState(false);
  const [selectCancel, setSelectCancel] = useState(null);
  const [isSelectTech, setIsSelectTech] = useState(false);

  const [formData, setFormData] = useState({
    room_id: "",
    problem_description: "",
    assigned_to: "",
    tech_name: "",
    tech_type_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.room_id) {
      toast.error("Please select a room to assign the work.");
      return;
    }

    if (isSelectTech == false) {
      toast.error("Please select a technician to assign the work.");
      return;
    }

    try {
      const response = await CreateTask(formData, token);
      toast.success(response?.data?.message || "Work assigned successfully");
      setFormData({
        room_id: "",
        problem_description: "",
        assigned_to: "",
        tech_name: "",
        tech_type_id: "",
      });
      if (onAssign) return onAssign();

      // fetchTaskList();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Failed to assign work");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full mx-auto space-y-4">
        <div>
          <label className="block text-sm font-semibold">Room</label>
          <select
            name="room_id"
            // value={formData.room_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            defaultValue={formData.room_id || ""}
          >
            <option value="" disabled>
              Select Room
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_number}
              </option>
            ))}
          </select>
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
                onClick={() => {
                  setFormData({
                    ...formData,
                    assigned_to: tech.id,
                    tech_name: tech.full_name,
                    tech_type_id: tech.type_id,
                  });
                  setIsSelectTech(true);
                }}
                className={`cursor-pointer p-2 border  rounded-lg shadow-sm transition-all ${
                  formData.assigned_to == tech.id
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
              {formData?.tech_name ? (
                `${formData?.tech_name} (${CheckTypeTechnician(
                  formData?.tech_type_id
                )})`
              ) : (
                <span className="text-red-500">No technician selected</span>
              )}
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
    </>
  );
}
