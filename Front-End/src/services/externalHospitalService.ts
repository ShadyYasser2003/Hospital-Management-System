import api from '@/lib/api';

export interface ExternalHospitalDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface CreateHospitalPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive?: boolean;
}

const externalHospitalService = {
  async getAll(): Promise<ExternalHospitalDto[]> {
    const { data } = await api.get<ExternalHospitalDto[]>('/api/external-hospitals');
    return data;
  },

  async getById(id: number | string): Promise<ExternalHospitalDto> {
    const { data } = await api.get<ExternalHospitalDto>(`/api/external-hospitals/${id}`);
    return data;
  },

  async create(payload: CreateHospitalPayload): Promise<ExternalHospitalDto> {
    const { data } = await api.post<ExternalHospitalDto>('/api/external-hospitals', payload);
    return data;
  },

  async update(
    id: number | string,
    payload: Partial<CreateHospitalPayload>
  ): Promise<ExternalHospitalDto> {
    const { data } = await api.put<ExternalHospitalDto>(`/api/external-hospitals/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/external-hospitals/${id}`);
  },
};

export default externalHospitalService;