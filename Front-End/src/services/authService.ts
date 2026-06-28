import api from '@/lib/api';
import { UserRole } from '@/types';

// ── DTOs matching the backend ─────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface BackendUserDto {
  id: number;
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password?: string;
  address?: string;
  phone: string;
  role: string;
  avatar?: string;
  status: string;
}

export interface LoginResponse {
  AccessToken: string;   // capital A — matches backend field
  refreshToken: string;
  type: string;
  user: BackendUserDto;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

// ── Role mapping: backend UPPERCASE → frontend lowercase ─────────────────────
export function mapRole(backendRole: string): UserRole {
  const map: Record<string, UserRole> = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    RECEPTIONIST: 'receptionist',
    PHARMACIST: 'pharmacist',
    ACCOUNTANT: 'accountant',
    TECHNICIAN: 'technician',
    PATIENT: 'patient',
  };
  return map[backendRole?.toUpperCase()] ?? 'patient';
}

// ── Service ───────────────────────────────────────────────────────────────────

const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/api/auth/login', credentials);
    return data;
  },

  async getMe(): Promise<BackendUserDto> {
    const { data } = await api.get<BackendUserDto>('/api/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },

  async changePassword(userId: number | string, payload: ChangePasswordRequest): Promise<string> {
    const { data } = await api.put<string>(`/api/auth/change-password/${userId}`, payload);
    return data;
  },

  async resetPassword(userId: number | string, newPassword: string): Promise<string> {
    const payload: ResetPasswordRequest = { newPassword };
    const { data } = await api.put<string>(`/api/auth/${userId}/reset-password`, payload);
    return data;
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<string>('/api/auth/forgot-password', { email });
    return data;
  },
};

export default authService;
