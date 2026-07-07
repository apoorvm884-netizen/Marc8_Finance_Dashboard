import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { AuthState, ChangePasswordData, LoginCredentials, UpdateProfileData, User } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';
import { authService } from '@/services/auth.service';
import { parseError } from '@/lib/utils';

// TEMPORARY DEVELOPER DEMO LOGIN — remove when backend is integrated
const DEV_ACCOUNT = {
  username: 'developer@marc8.local',
  password: 'Marc8@Demo123',
};
// END TEMPORARY DEVELOPER DEMO LOGIN

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  guestLogin: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

function createGuestUser(): User {
  return {
    id: 'guest-001',
    username: 'guest',
    email: 'guest@demo.com',
    first_name: 'Demo',
    last_name: 'User',
    role: 'super_admin',
    is_active: true,
    is_first_login: false,
    last_login_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function getInitialState(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (stored) {
      const parsed = JSON.parse(stored) as { user: User; token: string };
      if (parsed.token === 'demo-token-guest-access') {
        return {
          user: createGuestUser(),
          token: parsed.token,
          isAuthenticated: true,
          isLoading: false,
          isFirstLogin: false,
        };
      }
      return {
        user: null,
        token: parsed.token,
        isAuthenticated: false,
        isLoading: true,
        isFirstLogin: false,
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isFirstLogin: false,
  };
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; isFirstLogin: boolean } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'AUTH_LOADED'; payload: { user: User; token: string; isFirstLogin: boolean } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'PASSWORD_CHANGED' }
  | { type: 'SET_LOADING'; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isFirstLogin: action.payload.isFirstLogin,
      };
    case 'AUTH_FAILURE':
      return { ...initialState, isLoading: false };
    case 'AUTH_LOADED':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isFirstLogin: action.payload.isFirstLogin,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'PASSWORD_CHANGED':
      return { ...state, isFirstLogin: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredAuth(): { user: User; token: string } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (stored) {
      return JSON.parse(stored) as { user: User; token: string };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
  return null;
}

function setStoredAuth(user: User, token: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ user, token }));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

function clearStoredAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  } catch {
    // localStorage may be unavailable
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);

  useEffect(() => {
    if (state.token === 'demo-token-guest-access') return;

    const stored = getStoredAuth();
    if (stored && stored.token !== 'demo-token-guest-access') {
      authService
        .getProfile()
        .then((user) => {
          dispatch({
            type: 'AUTH_LOADED',
            payload: { user, token: stored.token, isFirstLogin: false },
          });
          setStoredAuth(user, stored.token);
        })
        .catch(() => {
          clearStoredAuth();
          dispatch({ type: 'AUTH_FAILURE' });
        });
    }
  }, [state.token]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    // TEMPORARY DEVELOPER DEMO LOGIN — remove when backend is integrated
    if (
      credentials.username === DEV_ACCOUNT.username &&
      credentials.password === DEV_ACCOUNT.password
    ) {
      const { demoUser } = await import('@/services/demo-data');
      const mockToken = 'demo-token-guest-access';
      setStoredAuth(demoUser, mockToken);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: demoUser, token: mockToken, isFirstLogin: false },
      });
      return;
    }
    // END TEMPORARY DEVELOPER DEMO LOGIN

    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token, isFirstLogin } = await authService.login(credentials);
      setStoredAuth(user, token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token, isFirstLogin: isFirstLogin ?? false } });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw new Error(parseError(error));
    }
  }, []);

  const guestLogin = useCallback(async () => {
    const { demoUser } = await import('@/services/demo-data');
    const mockToken = 'demo-token-guest-access';
    setStoredAuth(demoUser, mockToken);
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user: demoUser, token: mockToken, isFirstLogin: false },
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // proceed with local logout even if API fails
    }
    clearStoredAuth();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      dispatch({ type: 'PASSWORD_CHANGED' });
    } catch (error) {
      throw new Error(parseError(error));
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      const currentToken = state.token;
      if (currentToken) {
        setStoredAuth(updatedUser, currentToken);
      }
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      throw new Error(parseError(error));
    }
  }, [state.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      guestLogin,
      changePassword,
      updateProfile,
    }),
    [state, login, logout, guestLogin, changePassword, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
