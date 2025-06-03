import React from "react";
import AssignWorkForm from "@/components/technician/AssignWorkForm";
import { data } from "@/constant/data";

const users = data.users;

const RepairWork = () => {
  return (
    <div className="flex flex-col gap-2">
      <AssignWorkForm
        technicians={users.filter((u) => u.role == "technician")}
      />
    </div>
  );
};

export default RepairWork;
