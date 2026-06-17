import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';
import authService, { mapRole } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usernameOrId: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  /** @deprecated kept for backward-compat — no-op in API mode */
  registerCredentials: (username: string, nationalId: string, userId: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Convert backend UserDto → frontend User */
function mapBackendUser(dto: {
  id: number;
  username: string;
  name: string;
  email: string;
  nationalId: string;
  phone: string;
  role: string;
  avatar?: string;
  status: string;
  address?: string;
}): User {
  return {
    id: String(dto.id),
    username: dto.username,
    nationalId: dto.nationalId ?? '',
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? '',
    role: mapRole(dto.role),
    status: dto.status?.toLowerCase() === 'active' ? 'active' : 'inactive',
    avatar: dto.avatar,
    createdAt: new Date().toISOString().split('T')[0],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('hms_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // no-op — kept so existing pages that call registerCredentials don't break
  const registerCredentials = useCallback(() => {}, []);

  const login = useCallback(
    async (usernameOrId: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
      try {
        const response = await authService.login({ username: usernameOrId, password });

        // Store access token
        const token = response.AccessToken;
        if (token) {
          localStorage.setItem('hms_token', token);
        }

        // Store refresh token
        if (response.refreshToken) {
          localStorage.setItem('hms_refresh_token', response.refreshToken);
        }

        // Map and store user
        const mappedUser = mapBackendUser(response.user);
        setUser(mappedUser);
        localStorage.setItem('hms_user', JSON.stringify(mappedUser));

        return { success: true, user: mappedUser };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        return { success: false, error: message };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors — clear local state regardless
    } finally {
      setUser(null);
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_refresh_token');
      localStorage.removeItem('hms_user');
    }
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('hms_user', JSON.stringify(updatedUser));
      }
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not authenticated' };
      if (currentPassword === newPassword) {
        return { success: false, error: 'New password must be different from current password' };
      }
      if (newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }
      try {
        await authService.changePassword(user.id, {
          oldPassword: currentPassword,
          newPassword,
          confirmPassword: newPassword,
        });
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to change password';
        return { success: false, error: message };
      }
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, updateProfile, changePassword, registerCredentials }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getRoleDashboardPath = (role: UserRole): string => {
  const paths: Record<UserRole, string> = {
    admin: '/admin',
    doctor: '/doctor',
    nurse: '/nurse',
    receptionist: '/receptionist',
    pharmacist: '/pharmacist',
    accountant: '/accountant',
    technician: '/technician',
    patient: '/patient',
  };
  return paths[role];
};
