import api from '@/lib/api';

export interface PharmacistDto {
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
  licenseExpiryDate?: string;
  shift?: string;
}

export interface CreatePharmacistPayload {
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password: string;
  phone: string;
  address?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  shift?: string;
}

const pharmacistService = {
  async getAll(): Promise<PharmacistDto[]> {
    const { data } = await api.get<PharmacistDto[]>('/api/pharmacists');
    return data;
  },

  async getById(id: number | string): Promise<PharmacistDto> {
    const { data } = await api.get<PharmacistDto>(`/api/pharmacists/${id}`);
    return data;
  },

  async create(payload: CreatePharmacistPayload): Promise<PharmacistDto> {
    const { data } = await api.post<PharmacistDto>('/api/pharmacists', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreatePharmacistPayload>): Promise<PharmacistDto> {
    const { data } = await api.put<PharmacistDto>(`/api/pharmacists/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/pharmacists/${id}`);
  },
};

export default pharmacistService;
