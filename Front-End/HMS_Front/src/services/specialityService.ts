import api from '@/lib/api';

export interface SpecialityDto {
  id: number;
  name: string;
  description?: string;
}

export interface CreateSpecialityPayload {
  name: string;
  description?: string;
}

const specialityService = {
  async getAll(): Promise<SpecialityDto[]> {
    const { data } = await api.get<SpecialityDto[]>('/api/specialities');
    return data;
  },

  async getById(id: number | string): Promise<SpecialityDto> {
    const { data } = await api.get<SpecialityDto>(`/api/specialities/${id}`);
    return data;
  },

  async getByName(name: string): Promise<SpecialityDto> {
    const { data } = await api.get<SpecialityDto>(`/api/specialities/name/${name}`);
    return data;
  },

  async create(payload: CreateSpecialityPayload): Promise<SpecialityDto> {
    const { data } = await api.post<SpecialityDto>('/api/specialities', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateSpecialityPayload>): Promise<SpecialityDto> {
    const { data } = await api.put<SpecialityDto>(`/api/specialities/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/specialities/${id}`);
  },

  async assignDoctor(doctorId: number | string, specialityId: number | string): Promise<void> {
    await api.put(`/api/specialities/transfer/${doctorId}/doctor/${specialityId}/speciality`);
  },

  async assignNurse(nurseId: number | string, specialityId: number | string): Promise<void> {
    await api.put(`/api/specialities/transfer/${nurseId}/nurse/${specialityId}/speciality`);
  },
};

export default specialityService;
