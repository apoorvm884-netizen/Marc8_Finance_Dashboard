import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/config/constants';

interface RecentPage {
  path: string;
  label: string;
  timestamp: number;
}

interface AppState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  currentRoute: string;
  recentlyViewed: RecentPage[];
}

interface AppContextValue extends AppState {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCurrentRoute: (route: string) => void;
  addRecentlyViewed: (path: string, label: string) => void;
}

type AppAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_MOBILE_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_CURRENT_ROUTE'; payload: string }
  | { type: 'ADD_RECENTLY_VIEWED'; payload: RecentPage };

const AppContext = createContext<AppContextValue | null>(null);

function getInitialCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
    return stored === 'true';
  } catch {
    return false;
  }
}

function getInitialRecentPages(): RecentPage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_PAGES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistRecentPages(pages: RecentPage[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECENT_PAGES, JSON.stringify(pages));
  } catch {
    // ignore
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SET_MOBILE_SIDEBAR_OPEN':
      return { ...state, mobileSidebarOpen: action.payload };
    case 'SET_CURRENT_ROUTE':
      return { ...state, currentRoute: action.payload };
    case 'ADD_RECENTLY_VIEWED': {
      const filtered = state.recentlyViewed.filter(
        (p) => p.path !== action.payload.path
      );
      const updated = [action.payload, ...filtered].slice(0, 10);
      persistRecentPages(updated);
      return { ...state, recentlyViewed: updated };
    }
    default:
      return state;
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    sidebarCollapsed: getInitialCollapsed(),
    mobileSidebarOpen: false,
    currentRoute: '',
    recentlyViewed: getInitialRecentPages(),
  });

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR, String(collapsed));
    } catch {
      // ignore
    }
  }, []);

  const setMobileSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_MOBILE_SIDEBAR_OPEN', payload: open });
  }, []);

  const setCurrentRoute = useCallback((route: string) => {
    dispatch({ type: 'SET_CURRENT_ROUTE', payload: route });
  }, []);

  const addRecentlyViewed = useCallback((path: string, label: string) => {
    dispatch({ type: 'ADD_RECENTLY_VIEWED', payload: { path, label, timestamp: Date.now() } });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      toggleSidebar,
      setSidebarCollapsed,
      setMobileSidebarOpen,
      setCurrentRoute,
      addRecentlyViewed,
    }),
    [state, toggleSidebar, setSidebarCollapsed, setMobileSidebarOpen, setCurrentRoute, addRecentlyViewed]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}
