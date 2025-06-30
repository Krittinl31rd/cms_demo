import axios from "axios";

export const GetMaintenanceTask = async (token, form) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-maintenancetask", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
