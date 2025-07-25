import axios from "axios";

export const GetSummary = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/get-summary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// export const GetTotalRCUs = async (token) =>
//   await axios.get(import.meta.env.VITE_API_URL + "/get-total_rcu", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
