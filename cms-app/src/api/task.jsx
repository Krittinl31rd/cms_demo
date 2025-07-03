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

export const GetRoomNumberFloor = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-rooms-number-floor", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const CreateTask = async (formData, token) =>
  await axios.post(
    import.meta.env.VITE_API_URL + "/create-maintenancetask",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const UpdateTask = async (formData, token) =>
  await axios.put(
    import.meta.env.VITE_API_URL + "/update-maintenancetask",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
