import { create } from "zustand";

export const useFavoriteStore = create((set) => ({
  updatedAt: Date.now(),
  refreshFavorites: () => set({ updatedAt: Date.now() }),
}));
