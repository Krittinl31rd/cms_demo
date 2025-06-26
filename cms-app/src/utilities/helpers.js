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

// COIL STATUS, INPUT STATUS, HOLDING REGISTER,  INPUT REGISTER
