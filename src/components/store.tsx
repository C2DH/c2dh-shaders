import { create } from "zustand";

// Define the store
const useGlobalState = create((set) => ({
  showGLSL: true, // Initial state for showGLSL
  showTS: false, // Initial state for showTS
  isListening: false, // Initial state for isListening
  setShowGLSL: (value: boolean) => set({ showGLSL: value }), // Action to update showGLSL
  setShowTS: (value: boolean) => set({ showTS: value }), // Action to update showTS
  setIsListening: (value: boolean) => set({ isListening: value }),
}));

export default useGlobalState;
