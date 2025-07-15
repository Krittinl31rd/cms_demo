export const colorBadge = {
  1: "bg-gray-300/80 text-gray-950",
  2: "bg-yellow-300/80 text-yellow-950",
  3: "bg-blue-300/80 text-blue-950",
  4: "bg-green-300/80 text-green-950",
  5: "bg-red-300/80 text-red-950",
};

export const taskStatusId = {
  1: "PENDING",
  2: "ASSIGNED",
  3: "IN_PROGRESS",
  4: "COMPLETED",
  5: "UNRESOLVED",
};

export const CheckFunctionModbus = (value) => {
  if (!value || typeof value !== "number") return null;

  let name = "";
  let address = 0;
  let funct = 0;

  if (value >= 40000) {
    name = "IR";
    address = value - 40000;
    funct = 40000;
  } else if (value >= 30000) {
    name = "HR";
    address = value - 30000;
    funct = 30000;
  } else if (value >= 20000) {
    name = "IS";
    address = value - 20000;
    funct = 20000;
  } else if (value >= 10000) {
    name = "CS";
    address = value - 10000;
    funct = 10000;
  } else {
    name = "UNKNOWN";
    address = value;
    funct = 0;
  }

  return { name, address, funct };
};

export const CheckRoleName = (value) => {
  if (!value || typeof value !== "number") return null;

  let name = "";
  switch (value) {
    case 1:
      name = "Super Admin";
      break;
    case 2:
      name = "Front Desk";
      break;
    case 3:
      name = "Technician Lead";
      break;
    case 4:
      name = "Technician";
      break;
    case 5:
      name = "Maid Supervisor";
      break;
    case 6:
      name = "Maid";
      break;
    default:
      name = "Unknown Role";
  }

  return name;
};

export const CheckTypeTechnician = (value) => {
  if (!value || typeof value !== "number") return null;

  let name = "";
  switch (value) {
    case 1:
      name = "RCU";
      break;
    case 2:
      name = "Electrical";
      break;
    case 3:
      name = "Other";
      break;
    default:
      name = "Unknown Type";
  }

  return name;
};

const mutuallyExclusive = {
  status_1: "status_0",
  status_0: "status_1",
  check_1: "check_0",
  check_0: "check_1",
  gi_1: "gi_0",
  gi_0: "gi_1",
  dnd_1: ["mur_1", "noservice"],
  mur_1: ["dnd_1", "noservice"],
  noservice: ["dnd_1", "mur_1"],
};

export const useRoomFilters = (filters, setFilters) => {
  const toggleFilter = (filterKey) => {
    const [key] = filterKey.split("_");

    // ลบ filter ตัวเดิมที่ใช้ key เดียวกัน
    const updated = filters.filter((f) => !f.startsWith(`${key}_`));

    // ถ้าเดิมเลือกอยู่แล้ว -> ไม่ต้องเพิ่มใหม่ (หมายถึง toggle off)
    const isAlreadySelected = filters.includes(filterKey);

    // ถ้ายังไม่ได้เลือก -> ใส่เข้าไป
    if (!isAlreadySelected) {
      updated.push(filterKey);
    }

    // จัดการ mutually exclusive filters เช่น dnd, mur
    // const conflicts = mutuallyExclusive[filterKey];
    // if (conflicts) {
    //   const conflictArray = Array.isArray(conflicts) ? conflicts : [conflicts];
    //   setFilters(updated.filter((f) => !conflictArray.includes(f)));
    // } else {
    //   setFilters(updated);
    // }
    setFilters(updated);
  };

  return { toggleFilter };
};

export const doesTaskMatchFilters = (task, filters) => {
  return filters.every((filterKey) => {
    if (filterKey === "noservice") {
      return task.dnd_status === 0 && task.mur_status === 0;
    }

    const [key, rawValue] = filterKey.split("_");
    const value = isNaN(rawValue) ? rawValue : Number(rawValue);

    switch (key) {
      case "status":
        return task.is_online === value;
      case "check":
        return task.room_check_status === value;
      case "gi":
        return task.guest_status_id === value;
      case "dnd":
        return task.dnd_status === value;
      case "mur":
        return task.mur_status === value;
      case "taskStatus":
        return task.status_id === value;
      case "assign":
        return task.assigned_to === value;
      case "createdBy":
        return task.created_by === value;
      case "assignedToType":
        return task.assigned_to_type === value;
      default:
        return true;
    }
  });
};

export function getFilterLabel(
  filterKey,
  technicianList = [],
  maintenance_status,
  createdByOptions = [],
  assignedToTypeOptions = []
) {
  if (!filterKey) return "";

  if (filterKey === "noservice") return "No Service";

  const [key, rawValue] = filterKey.split("_");
  const value = isNaN(rawValue) ? rawValue : Number(rawValue);

  switch (key) {
    case "taskStatus":
      return (
        {
          [maintenance_status.ASSIGNED]: "Assigned",
          [maintenance_status.IN_PROGRESS]: "In Progress",
          [maintenance_status.FIXED]: "Fixed",
          [maintenance_status.UNRESOLVED]: "Unresolved",
        }[value] || filterKey
      );

    case "assign":
      const tech = technicianList.find((t) => t.id === value);
      return tech ? tech.full_name : filterKey;

    case "createdBy":
      const creator = createdByOptions.find((c) => c.value === value);
      return creator ? creator.label : `User #${value}`;

    case "assignedToType":
      const type = assignedToTypeOptions.find((c) => c.value === value);
      return type ? type.label : `Type #${value}`;

    case "status":
      return value === 1 ? "Online" : "Offline";

    case "check":
      return value === 1 ? "Checked In" : "Checked Out";

    case "gi":
      return value === 1 ? "Guest In" : "Guest Out";

    case "dnd":
      return value === 1 ? "DND" : "No DND";

    case "mur":
      return value === 1 ? "Make Up Room" : "No MUR";

    default:
      return filterKey;
  }
}

// COIL STATUS, INPUT STATUS, HOLDING REGISTER,  INPUT REGISTER
