import api from '@/lib/api';

export interface AppointmentDto {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  department: string;
  appointmentDate: string;   // LocalDate → "yyyy-MM-dd"
  appointmentTime: string;   // LocalTime → "HH:mm:ss" or "HH:mm"
  type: string;
  status: string;
  notes?: string;
}

export interface CreateAppointmentPayload {
  patientId: number;
  doctorId: number;
  department?: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  notes?: string;
}

const appointmentService = {
  async getAll(): Promise<AppointmentDto[]> {
    const { data } = await api.get<AppointmentDto[]>('/api/appointments');
    return data;
  },

  async getById(id: number | string): Promise<AppointmentDto> {
    const { data } = await api.get<AppointmentDto>(`/api/appointments/${id}`);
    return data;
  },

  async getByPatient(patientId: number | string): Promise<AppointmentDto[]> {
    const { data } = await api.get<AppointmentDto[]>(`/api/appointments/patient/${patientId}`);
    return data;
  },

  async getByDoctor(doctorId: number | string): Promise<AppointmentDto[]> {
    const { data } = await api.get<AppointmentDto[]>(`/api/appointments/doctor/${doctorId}`);
    return data;
  },

  async getByStatus(status: string): Promise<AppointmentDto[]> {
    const { data } = await api.get<AppointmentDto[]>(`/api/appointments/status/${status}`);
    return data;
  },

  async getByDate(date: string): Promise<AppointmentDto[]> {
    const { data } = await api.get<AppointmentDto[]>(`/api/appointments/date/${date}`);
    return data;
  },

  async getByDepartment(department: string): Promise<AppointmentDto[]> {
    const { data } = await api.get<AppointmentDto[]>(`/api/appointments/department/${department}`);
    return data;
  },

  async create(payload: CreateAppointmentPayload): Promise<AppointmentDto> {
    const { data } = await api.post<AppointmentDto>('/api/appointments', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateAppointmentPayload>): Promise<AppointmentDto> {
    const { data } = await api.put<AppointmentDto>(`/api/appointments/${id}`, payload);
    return data;
  },

  async confirm(id: number | string): Promise<AppointmentDto> {
    const { data } = await api.put<AppointmentDto>(`/api/appointments/${id}/confirm`);
    return data;
  },

  async complete(id: number | string): Promise<AppointmentDto> {
    const { data } = await api.put<AppointmentDto>(`/api/appointments/${id}/complete`);
    return data;
  },

  async cancel(id: number | string): Promise<AppointmentDto> {
    const { data } = await api.put<AppointmentDto>(`/api/appointments/${id}/cancel`);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/appointments/${id}`);
  },
};

export default appointmentService;
