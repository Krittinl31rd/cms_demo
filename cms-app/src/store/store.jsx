import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
});

const usePersist = {
  name: "store",
  storage: createJSONStorage(() => localStorage),
};

const useStore = create(persist(store, usePersist));

export default useStore;
