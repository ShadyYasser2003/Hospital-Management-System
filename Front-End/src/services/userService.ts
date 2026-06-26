import api from '@/lib/api';

export interface UserDto {
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
  dateOfBirth?: string;
  // Role-specific fields (populated depending on role)
  licenseNumber?: string;
  licenseExpiryDate?: string;
  specialization?: string;
  qualification?: string;
  medicalSchool?: string;
  yearOfGraduation?: number;
  yearsOfExperience?: number;
  hireDate?: string;
  employmentStatus?: string;
  shift?: string;
  departmentName?: string;
  employeeNumber?: string;
  specialityArea?: string;
  hipaaTrainingDate?: string;
  customerServiceTraining?: string;
}

export interface CreateUserPayload {
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password: string;
  phone: string;
  role: string;
  address?: string;
  dateOfBirth?: string;
  // Role-specific
  licenseNumber?: string;
  licenseExpiryDate?: string;
  specialization?: string;
  qualification?: string;
  medicalSchool?: string;
  yearOfGraduation?: number;
  yearsOfExperience?: number;
  hireDate?: string;
  employmentStatus?: string;
  shift?: string;
  employeeNumber?: string;
  specialityArea?: string;
  hipaaTrainingDate?: string;
  customerServiceTraining?: string;
}

const userService = {
  async getAll(): Promise<UserDto[]> {
    const { data } = await api.get<UserDto[]>('/api/users');
    return data;
  },

  async getById(id: number | string): Promise<UserDto> {
    const { data } = await api.get<UserDto>(`/api/users/${id}`);
    return data;
  },

  async search(query: string): Promise<UserDto[]> {
    const { data } = await api.get<UserDto[]>('/api/users/search', { params: { query } });
    return data;
  },

  async create(payload: CreateUserPayload): Promise<UserDto> {
    const { data } = await api.post<UserDto>('/api/users', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateUserPayload>): Promise<UserDto> {
    const { data } = await api.put<UserDto>(`/api/users/${id}`, payload);
    return data;
  },

  async updateStatus(id: number | string, status: 'ACTIVE' | 'INACTIVE'): Promise<UserDto> {
    const { data } = await api.patch<UserDto>(`/api/users/${id}/status`, { status });
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },
};

export default userService;
