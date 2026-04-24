import api from '@/lib/api';

export interface NurseDto {
  id: number;
  username: string;
  name: string;
  email: string;
  nationalId: string;
  phone: string;
  role: string;
  status: string;
  address?: string;
  avatar?: string;
  licenseNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
  hireDate?: string;
  employmentStatus?: string;
  shift?: string;
}

export interface CreateNursePayload {
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password: string;
  phone: string;
  address?: string;
  licenseNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
  hireDate?: string;
  shift?: string;
}

const nurseService = {
  async getAll(): Promise<NurseDto[]> {
    const { data } = await api.get<NurseDto[]>('/api/nurse');
    return data;
  },

  async getById(id: number | string): Promise<NurseDto> {
    const { data } = await api.get<NurseDto>(`/api/nurse/${id}`);
    return data;
  },

  async create(payload: CreateNursePayload): Promise<NurseDto> {
    const { data } = await api.post<NurseDto>('/api/nurse', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateNursePayload>): Promise<NurseDto> {
    const { data } = await api.put<NurseDto>(`/api/nurse/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/nurse/${id}`);
  },
};

export default nurseService;
