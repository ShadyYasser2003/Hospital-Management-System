import api from '@/lib/api';

export interface DepartmentDto {
  id: number;
  name: string;
  description?: string;
  location?: string;
  budget?: string;
  isActive: boolean;
  totalBeds?: number;
  availableBeds?: number;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  location?: string;
  budget?: string;
  isActive?: boolean;
  totalBeds?: number;
  availableBeds?: number;
}

const departmentService = {
  async getAll(): Promise<DepartmentDto[]> {
    const { data } = await api.get<DepartmentDto[]>('/api/departments');
    return data;
  },

  async getById(id: number | string): Promise<DepartmentDto> {
    const { data } = await api.get<DepartmentDto>(`/api/departments/${id}`);
    return data;
  },

  async create(payload: CreateDepartmentPayload): Promise<DepartmentDto> {
    const { data } = await api.post<DepartmentDto>('/api/departments', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateDepartmentPayload>): Promise<DepartmentDto> {
    const { data } = await api.put<DepartmentDto>(`/api/departments/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/departments/${id}`);
  },
};

export default departmentService;
