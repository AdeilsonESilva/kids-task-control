import { Child } from "@/types/child";
import { create } from "zustand";

// State
interface ChildState {
  children: Child[];
  selectedChild?: Child;
  isLoading: boolean;
  isCreatingModal: boolean;
}

// Actions
interface ChildActions {
  setChildren: (children: Child[]) => void;
  addChild: (child: Child) => void;
  selectChild: (child?: Child) => void;
  setLoading: (loading: boolean) => void;
  setCreatingModal: (loading: boolean) => void;
}

// Store
export const useChildStore = create<ChildState & ChildActions>((set) => ({
  children: [],
  isLoading: false,
  selectedChild: undefined,
  isCreatingModal: false,

  setChildren: (children) => set({ children }),

  addChild: (child) =>
    set((state) => ({
      children: [...state.children, child],
    })),

  selectChild: (child) => set({ selectedChild: child }),

  setLoading: (loading) => set({ isLoading: loading }),

  setCreatingModal: (creating) => set({ isCreatingModal: creating }),
}));

// Selectors child store
export const useChildren = () => useChildStore((state) => state.children);
export const useSelectedChild = () =>
  useChildStore((state) => state.selectedChild);
