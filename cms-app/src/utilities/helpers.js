export const colorBadge = {
  1: "bg-gray-300/80 text-gray-950",
  2: "bg-yellow-300/80 text-yellow-950",
  3: "bg-blue-300/80 text-blue-950",
  4: "bg-green-300/80 text-green-950",
  5: "bg-red-300/80 text-red-950",
};

export const nameStatusId = {
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

// COIL STATUS, INPUT STATUS, HOLDING REGISTER,  INPUT REGISTER
