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

/** Fields accepted by PUT /api/patients/:id */
export interface UpdatePatientPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  allergies?: string;
  medicalHistory?: string;
  diagnosis?: string;
  notes?: string;
  /** Patient status: ACTIVE | ADMITTED | DISCHARGED */
  status?: string;
  // vitals
  bloodPressure?: string;
  temperature?: string;
  pulse?: string;
  weight?: string;
  height?: string;
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

  async update(id: number | string, payload: UpdatePatientPayload): Promise<PatientDto> {
    const { data } = await api.put<PatientDto>(`/api/patients/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/patients/${id}`);
  },

  async search(query: string): Promise<PatientDto[]> {
    const { data } = await api.get<PatientDto[]>('/api/patients/search', { params: { query } });
    return data;
  },

  async getByStatus(status: string): Promise<PatientDto[]> {
    const { data } = await api.get<PatientDto[]>(`/api/patients/status/${status}`);
    return data;
  },

  async updateVitals(id: number | string, payload: UpdatePatientPayload): Promise<PatientDto> {
    const { data } = await api.put<PatientDto>(`/api/patients/${id}/vitals`, payload);
    return data;
  },
};

export default patientService;
