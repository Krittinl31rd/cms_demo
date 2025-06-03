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

export const GetUsers = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
