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

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },
};

export default userService;
