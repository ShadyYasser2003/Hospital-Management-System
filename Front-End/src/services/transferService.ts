import api from '@/lib/api';

export interface TransferRequestDto {
  id: number;
  patientId: number;
  requestedById: number;
  toHospitalId: number;
  reason: string;
  includeLabTests: boolean;
  includeRadiology: boolean;
  includeDiagnoses: boolean;
  patientName: string;
  requestedByName: string;
  toHospitalName: string;
  toHospitalEmail: string;
  /** PENDING | SENT | FAILED */
  status: string;
  transferredAt?: string;
  createdAt?: string;
}

export interface CreateTransferPayload {
  patientId: number;
  requestedById: number;
  toHospitalId: number;
  reason: string;
  includeLabTests: boolean;
  includeRadiology: boolean;
  includeDiagnoses: boolean;
}

const transferService = {
  async getAll(): Promise<TransferRequestDto[]> {
    const { data } = await api.get<TransferRequestDto[]>('/api/transfers');
    return data;
  },

  async getById(id: number | string): Promise<TransferRequestDto> {
    const { data } = await api.get<TransferRequestDto>(`/api/transfers/${id}`);
    return data;
  },

  async getByPatient(patientId: number | string): Promise<TransferRequestDto[]> {
    const { data } = await api.get<TransferRequestDto[]>(`/api/transfers/patient/${patientId}`);
    return data;
  },

  async create(payload: CreateTransferPayload): Promise<TransferRequestDto> {
    const { data } = await api.post<TransferRequestDto>('/api/transfers', payload);
    return data;
  },

  /** Triggers PDF generation + email send on the backend */
  async send(id: number | string): Promise<TransferRequestDto> {
    const { data } = await api.patch<TransferRequestDto>(`/api/transfers/${id}/send`);
    return data;
  },
};

export default transferService;
