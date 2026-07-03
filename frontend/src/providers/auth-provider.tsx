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

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isFirstLogin: false,
};

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
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
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
    } else {
      dispatch({ type: 'AUTH_FAILURE' });
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
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
      changePassword,
      updateProfile,
    }),
    [state, login, logout, changePassword, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
