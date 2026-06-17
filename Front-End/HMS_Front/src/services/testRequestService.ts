import api from '@/lib/api';

export interface TestRequestDto {
  id: number;
  testType: string;
  description?: string;
  priority: string;
  status: string;
  reportUrl?: string;
  results?: string;
  charges?: number;
  requestedAt: string;
  completedAt?: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  technicianId?: number;
  technicianName?: string;
}

export interface CreateTestRequestPayload {
  testType: string;
  description?: string;
  priority?: string;
  patientId: number;
  doctorId: number;
  charges?: number;
}

/** Normalize both PageImpl (old) and PagedModel VIA_DTO (new) response shapes */
const mapPage = (data: any): { content: TestRequestDto[]; totalElements: number } => ({
  content: data.content ?? [],
  totalElements: data.page?.totalElements ?? data.totalElements ?? 0,
});

const testRequestService = {
  async getAll(): Promise<TestRequestDto[]> {
    const { data } = await api.get<TestRequestDto[]>('/api/test-requests');
    return data;
  },

  async getById(id: number | string): Promise<TestRequestDto> {
    const { data } = await api.get<TestRequestDto>(`/api/test-requests/${id}`);
    return data;
  },

  async getByPatient(patientId: number | string): Promise<TestRequestDto[]> {
    const { data } = await api.get<TestRequestDto[]>(`/api/test-requests/patient/${patientId}`);
    return data;
  },

  async getByDoctor(doctorId: number | string): Promise<TestRequestDto[]> {
    const { data } = await api.get<TestRequestDto[]>(`/api/test-requests/doctor/${doctorId}`);
    return data;
  },

  async getByTechnician(technicianId: number | string, page = 0, size = 50): Promise<{ content: TestRequestDto[]; totalElements: number }> {
    const { data } = await api.get(`/api/test-requests/technician/${technicianId}`, { params: { page, size } });
    return mapPage(data);
  },

  async getByStatus(status: string): Promise<TestRequestDto[]> {
    const { data } = await api.get<TestRequestDto[]>(`/api/test-requests/status/${status}`);
    return data;
  },

  async create(payload: CreateTestRequestPayload): Promise<TestRequestDto> {
    const { data } = await api.post<TestRequestDto>('/api/test-requests', payload);
    return data;
  },

  async assignTechnician(id: number | string, technicianId: number | string): Promise<TestRequestDto> {
    const { data } = await api.put<TestRequestDto>(`/api/test-requests/${id}/assign/${technicianId}`);
    return data;
  },

  async acknowledge(id: number | string): Promise<TestRequestDto> {
    const { data } = await api.put<TestRequestDto>(`/api/test-requests/${id}/acknowledge`);
    return data;
  },

  async start(id: number | string): Promise<TestRequestDto> {
    const { data } = await api.put<TestRequestDto>(`/api/test-requests/${id}/start`);
    return data;
  },

  async complete(id: number | string, results: string, reportUrl: string, charges?: number): Promise<TestRequestDto> {
    const { data } = await api.put<TestRequestDto>(`/api/test-requests/${id}/complete`, { results, reportUrl, charges });
    return data;
  },

  async uploadReport(id: number | string, file: File): Promise<{ reportUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ reportUrl: string }>(`/api/test-requests/${id}/upload-report`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async cancel(id: number | string): Promise<TestRequestDto> {
    const { data } = await api.put<TestRequestDto>(`/api/test-requests/${id}/cancel`);
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/test-requests/${id}`);
  },
};

export default testRequestService;
