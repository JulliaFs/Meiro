import { create } from "zustand";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("ju-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export type PendingAction = "nova-anotacao" | "novo-curso" | "nova-fase" | null;

export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 380;
export const SIDEBAR_DEFAULT_WIDTH = 240;

function getInitialSidebarWidth(): number {
  const stored = Number(localStorage.getItem("ju-sidebar-width"));
  if (stored && stored >= SIDEBAR_MIN_WIDTH && stored <= SIDEBAR_MAX_WIDTH) return stored;
  return SIDEBAR_DEFAULT_WIDTH;
}

interface UiState {
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  mobileNavOpen: boolean;
  searchOpen: boolean;
  commandOpen: boolean;
  pendingAction: PendingAction;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  setPendingAction: (action: PendingAction) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: getInitialTheme(),
  sidebarCollapsed: false,
  sidebarWidth: getInitialSidebarWidth(),
  mobileNavOpen: false,
  searchOpen: false,
  commandOpen: false,
  pendingAction: null,
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("ju-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  },
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setSidebarWidth: (width) => {
    const clamped = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
    localStorage.setItem("ju-sidebar-width", String(clamped));
    set({ sidebarWidth: clamped });
  },
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setPendingAction: (action) => set({ pendingAction: action }),
}));
