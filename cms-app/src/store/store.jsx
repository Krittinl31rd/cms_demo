import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { GetSummary } from "@/api/summary";

const store = (set) => ({
  user: null,
  token: null,
  actionLogin: async (form) => {
    const res = await axios.post(import.meta.env.VITE_API_URL + "/login", form);
    set({
      user: res.data.payload,
      token: res.data.token,
    });
    return res;
  },
  actionLogout: async (form) => {
    await axios.post(import.meta.env.VITE_API_URL + "/logout", form);
    set({
      user: null,
      token: null,
    });
  },
  actionLogout2: async () => {
    set({
      user: null,
      token: null,
    });
  },
  breadcrumb: [],
  setBreadcrumb: (segments) => set({ breadcrumb: segments }),
  subscribeId: null,
  setSubscribeId: (id) => set({ subscribeId: id }),
  activeSection: null,
  setActiveSection: (type) => set({ activeSection: type }),
  summaryData: [],
  getSummary: async (token) => {
    try {
      const response = await GetSummary(token);
      set({ summaryData: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching summary:", error);
      throw error;
    }
  },
});

const usePersist = {
  name: "userPayload",
  storage: createJSONStorage(() => localStorage),
};

const useStore = create(persist(store, usePersist));

export default useStore;
