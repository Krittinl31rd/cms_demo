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
  actionLogout: async () => {
    set({
      user: null,
      token: null,
    });
  },
});

const usePersist = {
  name: "store",
  storage: createJSONStorage(() => localStorage),
};

const useStore = create(persist(store, usePersist));

export default useStore;
