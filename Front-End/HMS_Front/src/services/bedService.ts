import api from '@/lib/api';

export interface BedDto {
  id: number;
  bedNumber: string;
  wardName?: string;
  status: string;
  patientId?: number;
  patientName?: string;
}

export interface CreateBedPayload {
  bedNumber: string;
  wardName?: string;
  status?: string;
}

const bedService = {
  async getAll(): Promise<BedDto[]> {
    const { data } = await api.get<BedDto[]>('/api/beds');
    return data;
  },

  async getById(id: number | string): Promise<BedDto> {
    const { data } = await api.get<BedDto>(`/api/beds/${id}`);
    return data;
  },

  async getByBedNumber(bedNumber: string): Promise<BedDto> {
    const { data } = await api.get<BedDto>(`/api/beds/number/${bedNumber}`);
    return data;
  },

  async create(payload: CreateBedPayload): Promise<BedDto> {
    const { data } = await api.post<BedDto>('/api/beds', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateBedPayload & { patientId?: number; status?: string }>): Promise<BedDto> {
    const { data } = await api.put<BedDto>(`/api/beds/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/beds/${id}`);
  },
};

export default bedService;
