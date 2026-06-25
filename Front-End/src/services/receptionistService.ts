import api from '@/lib/api';

export interface ReceptionistDto {
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
  shift?: string;
  specialityArea?: string;
  hipaaTrainingDate?: string;
  customerServiceTraining?: string;
  employmentStatus?: string;
}

export interface CreateReceptionistPayload {
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password: string;
  phone: string;
  address?: string;
  shift?: string;
  specialityArea?: string;
  employmentStatus?: string;
}

const receptionistService = {
  async getAll(): Promise<ReceptionistDto[]> {
    const { data } = await api.get<ReceptionistDto[]>('/api/receptionist');
    return data;
  },

  async getById(id: number | string): Promise<ReceptionistDto> {
    const { data } = await api.get<ReceptionistDto>(`/api/receptionist/${id}`);
    return data;
  },

  async create(payload: CreateReceptionistPayload): Promise<ReceptionistDto> {
    const { data } = await api.post<ReceptionistDto>('/api/receptionist', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateReceptionistPayload>): Promise<ReceptionistDto> {
    const { data } = await api.put<ReceptionistDto>(`/api/receptionist/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/receptionist/${id}`);
  },
};

export default receptionistService;
