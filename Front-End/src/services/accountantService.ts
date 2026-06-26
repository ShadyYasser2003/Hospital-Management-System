import api from '@/lib/api';

export interface AccountantDto {
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
  employeeNumber?: string;
  employmentStatus?: string;
  shift?: string;
  departmentName?: string;
}

export interface CreateAccountantPayload {
  username: string;
  name: string;
  email: string;
  nationalId: string;
  password: string;
  phone: string;
  address?: string;
  employeeNumber?: string;
  shift?: string;
  employmentStatus?: string;
}

const accountantService = {
  async getAll(): Promise<AccountantDto[]> {
    const { data } = await api.get<AccountantDto[]>('/api/accountants');
    return data;
  },

  async getById(id: number | string): Promise<AccountantDto> {
    const { data } = await api.get<AccountantDto>(`/api/accountants/${id}`);
    return data;
  },

  async create(payload: CreateAccountantPayload): Promise<AccountantDto> {
    const { data } = await api.post<AccountantDto>('/api/accountants', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateAccountantPayload>): Promise<AccountantDto> {
    const { data } = await api.put<AccountantDto>(`/api/accountants/${id}`, payload);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/accountants/${id}`);
  },
};

export default accountantService;
