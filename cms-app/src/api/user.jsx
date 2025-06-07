import axios from "axios";

export const GetInvitationTokens = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-invite-tokens", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const GetPendingUsers = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-pending-users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const CreateUser = async (token, form) =>
  await axios.post(import.meta.env.VITE_API_URL + `/create-user`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const IsActiveUser = async (token, id, form) =>
  await axios.put(import.meta.env.VITE_API_URL + `/isactive-user/${id}`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const DeleteUser = async (token, id) =>
  await axios.delete(import.meta.env.VITE_API_URL + `/delete-user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const GetUsers = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
