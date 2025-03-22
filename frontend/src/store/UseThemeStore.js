import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "dark",  // Default theme from localStorage or 'dark'
  setTheme: (theme) => {
      localStorage.setItem("chat-theme", theme);  // Persist the theme in localStorage
      set({ theme });  // Update the theme in the store
  },
}));
