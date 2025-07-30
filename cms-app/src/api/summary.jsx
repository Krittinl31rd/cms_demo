import axios from "axios";

export const GetSummary = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-summary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const GetNotifications = async (token, query = {}) =>
  await axios.get(import.meta.env.VITE_API_URL + `/get-notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: query,
  });

// export const GetTotalRCUs = async (token) =>
//   await axios.get(import.meta.env.VITE_API_URL + "/get-total_rcu", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
