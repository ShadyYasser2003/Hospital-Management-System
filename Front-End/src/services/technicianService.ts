import api from '@/lib/api';

export interface TechnicianDto {
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
  certifications?: string;
  departmentId?: number;
  departmentName?: string;
}

export interface CreateTechnicianPayload {
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password: string;
  phone: string;
  address?: string;
  licenseNumber?: string;
  specialization?: string;
  shift?: string;
  employmentStatus?: string;
}

const technicianService = {
  async getAll(): Promise<TechnicianDto[]> {
    const { data } = await api.get<TechnicianDto[]>('/api/technicians');
    return data;
  },

  async getById(id: number | string): Promise<TechnicianDto> {
    const { data } = await api.get<TechnicianDto>(`/api/technicians/${id}`);
    return data;
  },

  async create(payload: CreateTechnicianPayload): Promise<TechnicianDto> {
    const { data } = await api.post<TechnicianDto>('/api/technicians', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateTechnicianPayload>): Promise<TechnicianDto> {
    const { data } = await api.put<TechnicianDto>(`/api/technicians/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/technicians/${id}`);
  },

  async searchByName(name: string): Promise<TechnicianDto[]> {
    const { data } = await api.get<TechnicianDto[]>('/api/technicians/search', { params: { name } });
    return data;
  },
};

export default technicianService;
