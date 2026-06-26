import api from '@/lib/api';

export interface DispensationDto {
  id: number;
  dispensedQuantity: number;
  dispensedDate: string;
  status: string;
  charges?: number;
  // Relational IDs (required on create)
  prescriptionId?: number;
  medicineId?: number;
  patientId?: number;
  pharmacistId?: number;
  // Display fields (populated on response)
  patientName?: string;
  pharmacistName?: string;
  medicineName?: string;
  prescriptionRef?: string;
}

export interface CreateDispensationPayload {
  prescriptionId: number;
  medicineId: number;
  patientId: number;
  pharmacistId?: number;
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

  async getByPrescription(prescriptionId: number | string): Promise<DispensationDto[]> {
    const { data } = await api.get<DispensationDto[]>(
      `/api/medicine-dispensations/prescription/${prescriptionId}`,
    );
    return data;
  },

  async getByPatient(patientId: number | string): Promise<DispensationDto[]> {
    const { data } = await api.get<DispensationDto[]>(
      `/api/medicine-dispensations/patient/${patientId}`,
    );
    return data;
  },

  async getByPharmacist(pharmacistId: number | string): Promise<DispensationDto[]> {
    const { data } = await api.get<DispensationDto[]>(
      `/api/medicine-dispensations/pharmacist/${pharmacistId}`,
    );
    return data;
  },

  async getByStatus(status: string): Promise<DispensationDto[]> {
    const { data } = await api.get<DispensationDto[]>(
      `/api/medicine-dispensations/status/${status}`,
    );
    return data;
  },

  async getPending(): Promise<DispensationDto[]> {
    const { data } = await api.get<DispensationDto[]>('/api/medicine-dispensations/pending');
    return data;
  },

  async getToday(): Promise<DispensationDto[]> {
    const { data } = await api.get<DispensationDto[]>('/api/medicine-dispensations/today');
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

  async cancel(id: number | string): Promise<DispensationDto> {
    const { data } = await api.put<DispensationDto>(`/api/medicine-dispensations/${id}/cancel`);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/medicine-dispensations/${id}`);
  },

  async getChargesByPatient(
    patientId: number | string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const { data } = await api.get<number>(
      `/api/medicine-dispensations/patient/${patientId}/charges`,
      { params: { startDate, endDate } },
    );
    return data;
  },
};

export default dispensationService;
