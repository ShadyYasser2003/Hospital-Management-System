import api from '@/lib/api';

export interface DoctorDto {
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
  // Doctor-specific
  licenseNumber?: string;
  specialization?: string;
  qualification?: string;
  medicalSchool?: string;
  yearOfGraduation?: number;
  yearsOfExperience?: number;
  hireDate?: string;
  employmentStatus?: string;
  shift?: string;
  departmentName?: string;
}

export interface CreateDoctorPayload {
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password: string;
  phone: string;
  address?: string;
  licenseNumber?: string;
  specialization?: string;
  qualification?: string;
  yearsOfExperience?: number;
  hireDate?: string;
  shift?: string;
}

const doctorService = {
  async getAll(): Promise<DoctorDto[]> {
    const { data } = await api.get<DoctorDto[]>('/api/doctor');
    return data;
  },

  async getById(id: number | string): Promise<DoctorDto> {
    const { data } = await api.get<DoctorDto>(`/api/doctor/${id}`);
    return data;
  },

  async searchByName(name: string): Promise<DoctorDto[]> {
    const { data } = await api.get<DoctorDto[]>('/api/doctor/name', { params: { name } });
    return data;
  },

  async searchByNationalId(nationalId: string): Promise<DoctorDto> {
    const { data } = await api.get<DoctorDto>('/api/doctor/nationalId', { params: { nationalId } });
    return data;
  },

  async create(payload: CreateDoctorPayload): Promise<DoctorDto> {
    const { data } = await api.post<DoctorDto>('/api/doctor', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateDoctorPayload>): Promise<DoctorDto> {
    const { data } = await api.put<DoctorDto>(`/api/doctor/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/doctor/${id}`);
  },

  async getByEmploymentStatus(status: string): Promise<DoctorDto[]> {
    const { data } = await api.get<DoctorDto[]>('/api/doctor/employmentStatus', {
      params: { employmentStatus: status },
    });
    return data;
  },

  async getBySpecialization(specialization: string): Promise<DoctorDto[]> {
    const { data } = await api.get<DoctorDto[]>('/api/doctor/specialization', {
      params: { specialization },
    });
    return data;
  },

  async getPatients(doctorId: number | string): Promise<import('./patientService').PatientDto[]> {
    const { data } = await api.get(`/api/doctor/${doctorId}/patients`);
    return data;
  },
};

export default doctorService;
