import axios from "axios";

export const CreateRoom = async (token, form) =>
  await axios.post(import.meta.env.VITE_API_URL + "/create-room", form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const GetRooms = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-rooms", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const UpadteRoom = async (token, id, form) =>
  await axios.put(import.meta.env.VITE_API_URL + `/update-room/${id}`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const GetRoomByID = async (token, id) =>
  await axios.get(import.meta.env.VITE_API_URL + `/get-room/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const DeleteRoom = async (token, id) =>
  await axios.delete(import.meta.env.VITE_API_URL + `/delete-room/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
