import { create } from "zustand";
// Define the store
const useGlobalState = create((set) => ({
    showGLSL: true, // Initial state for showGLSL
    showTS: false, // Initial state for showTS
    setShowGLSL: (value) => set({ showGLSL: value }), // Action to update showGLSL
    setShowTS: (value) => set({ showTS: value }), // Action to update showTS
}));
export default useGlobalState;
