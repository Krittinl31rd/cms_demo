export const CheckFunctionModbus = (value) => {
  if (!value || typeof value !== "number") return null;

  let name = "";
  let address = 0;

  if (value >= 30000) {
    name = "HOLDING REGISTER";
    address = value - 30000;
  } else if (value >= 40000) {
    name = "INPUT REGISTER";
    address = value - 40000;
  } else if (value >= 20000) {
    name = "INPUT STATUS";
    address = value - 20000;
  } else if (value >= 10000) {
    name = "COIL STATUS";
    address = value - 10000;
  } else {
    name = "UNKNOWN";
    address = value;
  }

  return { name, address };
};
