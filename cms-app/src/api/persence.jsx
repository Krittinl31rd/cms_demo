import axios from "axios";

export const GetGuestPersenceLogs = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-persence", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
