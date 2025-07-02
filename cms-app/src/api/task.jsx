import axios from "axios";

export const GetMaintenanceTask = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-maintenancetask", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const GetTechnician = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-technicians", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
