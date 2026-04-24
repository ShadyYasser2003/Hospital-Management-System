import api from '@/lib/api';

export interface PatientDto {
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
  // Patient-specific
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  allergies?: string;
  medicalHistory?: string;
  diagnosis?: string;
  notes?: string;
  bloodPressure?: string;
  temperature?: string;
  pulse?: string;
  weight?: string;
  height?: string;
}

export interface CreatePatientPayload {
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  allergies?: string;
  medicalHistory?: string;
}

const patientService = {
  async getAll(): Promise<PatientDto[]> {
    const { data } = await api.get<PatientDto[]>('/api/patients');
    return data;
  },

  async getById(id: number | string): Promise<PatientDto> {
    const { data } = await api.get<PatientDto>(`/api/patients/${id}`);
    return data;
  },

  async getByNationalId(nationalId: string): Promise<PatientDto> {
    const { data } = await api.get<PatientDto>(`/api/patients/national-id/${nationalId}`);
    return data;
  },

  async create(payload: CreatePatientPayload): Promise<PatientDto> {
    const { data } = await api.post<PatientDto>('/api/patients', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreatePatientPayload>): Promise<PatientDto> {
    const { data } = await api.put<PatientDto>(`/api/patients/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/patients/${id}`);
  },
};

export default patientService;
