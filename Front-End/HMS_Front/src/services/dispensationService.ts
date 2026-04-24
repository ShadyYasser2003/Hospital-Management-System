import api from '@/lib/api';

export interface DispensationDto {
  id: number;
  dispensedQuantity: number;
  dispensedDate: string;
  status: string;
  charges?: number;
}

export interface CreateDispensationPayload {
  prescriptionId: number;
  medicineId: number;
  dispensedQuantity: number;
  charges?: number;
}

const dispensationService = {
  async getAll(): Promise<DispensationDto[]> {
    const { data } = await api.get<DispensationDto[]>('/api/medicine-dispensations');
    return data;
  },

  async getById(id: number | string): Promise<DispensationDto> {
    const { data } = await api.get<DispensationDto>(`/api/medicine-dispensations/${id}`);
    return data;
  },

  async create(payload: CreateDispensationPayload): Promise<DispensationDto> {
    const { data } = await api.post<DispensationDto>('/api/medicine-dispensations', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateDispensationPayload>): Promise<DispensationDto> {
    const { data } = await api.put<DispensationDto>(`/api/medicine-dispensations/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/medicine-dispensations/${id}`);
  },
};

export default dispensationService;
