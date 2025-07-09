import axios from "axios";

export const GetMaintenanceTask = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-maintenancetask", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const GetMaintenanceTaskByUserID = async (id, token, query) =>
  await axios.get(
    import.meta.env.VITE_API_URL +
      `/get-maintenancetask/user/${id}/?status_id=${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

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

export const UpdateTask = async (token, id, formData) =>
  await axios.put(
    import.meta.env.VITE_API_URL + `/update-maintenancetask/${id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const DeleteTask = async (id, token) =>
  await axios.delete(
    import.meta.env.VITE_API_URL + `/delete-maintenancetask/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
