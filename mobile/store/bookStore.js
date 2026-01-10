import { create } from "zustand";

export const useBookStore = create((set) => ({
  updatedAt: Date.now(),
  refreshBooks: () => set({ updatedAt: Date.now() }),
}));
