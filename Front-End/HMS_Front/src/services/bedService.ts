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

  async getByStatus(status: string): Promise<BedDto[]> {
    const { data } = await api.get<BedDto[]>(`/api/beds/status/${status}`);
    return data;
  },

  async getByWard(wardName: string): Promise<BedDto[]> {
    const { data } = await api.get<BedDto[]>(`/api/beds/ward/${wardName}`);
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

  async assignPatient(bedId: number | string, patientId: number | string): Promise<BedDto> {
    const { data } = await api.put<BedDto>(`/api/beds/${bedId}/assign/${patientId}`);
    return data;
  },

  async releasePatient(id: number | string): Promise<BedDto> {
    const { data } = await api.put<BedDto>(`/api/beds/${id}/release`);
    return data;
  },

  async setMaintenance(id: number | string): Promise<BedDto> {
    const { data } = await api.put<BedDto>(`/api/beds/${id}/maintenance`);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/beds/${id}`);
  },
};

export default bedService;
