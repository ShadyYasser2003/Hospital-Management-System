import api from '@/lib/api';

export interface PrescriptionItemDto {
  id?: number;
  medicineId: number;
  medicineName?: string;
  dosage: string;
  frequency: string;
  duration: number;
  quantity: number;
  instructions?: string;
  dispensed?: boolean;
  dispensedQuantity?: number;
}

export interface PrescriptionDto {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  prescriptionDate: string;   // "yyyy-MM-dd"
  notes?: string;
  status: string;
  items: PrescriptionItemDto[];
}

export interface CreatePrescriptionPayload {
  patientId: number;
  doctorId: number;
  notes?: string;
  items: Omit<PrescriptionItemDto, 'id' | 'medicineName' | 'dispensed' | 'dispensedQuantity'>[];
}

const prescriptionService = {
  async getAll(): Promise<PrescriptionDto[]> {
    const { data } = await api.get<PrescriptionDto[]>('/api/prescriptions');
    return data;
  },

  async getById(id: number | string): Promise<PrescriptionDto> {
    const { data } = await api.get<PrescriptionDto>(`/api/prescriptions/${id}`);
    return data;
  },

  async getByPatient(patientId: number | string): Promise<PrescriptionDto[]> {
    const { data } = await api.get<PrescriptionDto[]>(`/api/prescriptions/patient/${patientId}`);
    return data;
  },

  async create(payload: CreatePrescriptionPayload): Promise<PrescriptionDto> {
    const { data } = await api.post<PrescriptionDto>('/api/prescriptions', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreatePrescriptionPayload>): Promise<PrescriptionDto> {
    const { data } = await api.put<PrescriptionDto>(`/api/prescriptions/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/prescriptions/${id}`);
  },
};

export default prescriptionService;
