/**
 * labTestService.ts
 *
 * Integrates with the NEW backend: GET/POST/PUT/PATCH/DELETE /api/lab-tests
 *
 * Key differences from the old testRequestService:
 *  - Base URL   : /api/lab-tests  (was /api/test-requests)
 *  - status     : query param ?status=  (was path param /status/{status})
 *  - technician : plain List response, NOT paginated
 *  - assign     : PATCH /{id}/assign-technician?technicianId=  (was PUT /{id}/assign/{id})
 *  - results    : PATCH /{id}/result  — adds notes/referenceRange/isCritical
 *  - REMOVED    : acknowledge, start, uploadReport, cancel, charges, priority, reportUrl
 *  - RENAMED    : requestedAt → orderedAt  |  results → result
 */

import api from '@/lib/api';

// ─── DTO ─────────────────────────────────────────────────────────────────────

export interface LabTestDto {
  id: number;

  patientId: number;
  patientName: string;

  doctorId: number;
  doctorName: string;

  technicianId?: number;
  technicianName?: string;

  /** e.g. "BLOOD_TEST", "CBC", "URINALYSIS" */
  testType: string;
  /** Human-readable name for the test */
  testName?: string;
  description?: string;

  /** PENDING | IN_PROGRESS | COMPLETED */
  status: string;

  /** ISO datetime string — replaces old `requestedAt` */
  orderedAt: string;
  sampleCollectedAt?: string;
  completedAt?: string;

  /** Technician's findings — replaces old `results` */
  result?: string;
  notes?: string;
  referenceRange?: string;
  isCritical?: boolean;
}

// ─── Payload for creating a new lab test ─────────────────────────────────────

export interface CreateLabTestPayload {
  patientId: number;
  doctorId: number;
  testType: string;
  testName?: string;
  description?: string;
}

// ─── Payload for entering results ────────────────────────────────────────────

export interface EnterLabResultPayload {
  result: string;
  notes?: string;
  referenceRange?: string;
  isCritical?: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

const labTestService = {
  /** GET /api/lab-tests */
  async getAll(): Promise<LabTestDto[]> {
    const { data } = await api.get<LabTestDto[]>('/api/lab-tests');
    return data;
  },

  /** GET /api/lab-tests/{id} */
  async getById(id: number | string): Promise<LabTestDto> {
    const { data } = await api.get<LabTestDto>(`/api/lab-tests/${id}`);
    return data;
  },

  /** GET /api/lab-tests/patient/{patientId} */
  async getByPatient(patientId: number | string): Promise<LabTestDto[]> {
    const { data } = await api.get<LabTestDto[]>(`/api/lab-tests/patient/${patientId}`);
    return data;
  },

  /** GET /api/lab-tests/doctor/{doctorId} */
  async getByDoctor(doctorId: number | string): Promise<LabTestDto[]> {
    const { data } = await api.get<LabTestDto[]>(`/api/lab-tests/doctor/${doctorId}`);
    return data;
  },

  /**
   * GET /api/lab-tests/technician/{technicianId}
   * NOTE: New backend returns a plain List (no pagination).
   */
  async getByTechnician(technicianId: number | string): Promise<LabTestDto[]> {
    const { data } = await api.get<LabTestDto[]>(`/api/lab-tests/technician/${technicianId}`);
    return data;
  },

  /**
   * GET /api/lab-tests/status?status={status}
   * NOTE: Changed from path variable to query param.
   */
  async getByStatus(status: string): Promise<LabTestDto[]> {
    const { data } = await api.get<LabTestDto[]>('/api/lab-tests/status', { params: { status } });
    return data;
  },

  /**
   * GET /api/lab-tests/type?testType={testType}
   */
  async getByType(testType: string): Promise<LabTestDto[]> {
    const { data } = await api.get<LabTestDto[]>('/api/lab-tests/type', { params: { testType } });
    return data;
  },

  /** GET /api/lab-tests/critical */
  async getCritical(): Promise<LabTestDto[]> {
    const { data } = await api.get<LabTestDto[]>('/api/lab-tests/critical');
    return data;
  },

  /** GET /api/lab-tests/patient/{patientId}/status?status={status} */
  async getByPatientAndStatus(patientId: number | string, status: string): Promise<LabTestDto[]> {
    const { data } = await api.get<LabTestDto[]>(`/api/lab-tests/patient/${patientId}/status`, {
      params: { status },
    });
    return data;
  },

  /** POST /api/lab-tests */
  async create(payload: CreateLabTestPayload): Promise<LabTestDto> {
    const { data } = await api.post<LabTestDto>('/api/lab-tests', payload);
    return data;
  },

  /** PUT /api/lab-tests/{id} */
  async update(id: number | string, payload: Partial<LabTestDto>): Promise<LabTestDto> {
    const { data } = await api.put<LabTestDto>(`/api/lab-tests/${id}`, payload);
    return data;
  },

  /**
   * PATCH /api/lab-tests/{id}/assign-technician?technicianId={technicianId}
   * Changed from: PUT /api/test-requests/{id}/assign/{technicianId}
   */
  async assignTechnician(id: number | string, technicianId: number | string): Promise<LabTestDto> {
    const { data } = await api.patch<LabTestDto>(
      `/api/lab-tests/${id}/assign-technician`,
      null,
      { params: { technicianId } },
    );
    return data;
  },

  /**
   * PATCH /api/lab-tests/{id}/result
   * Replaces old complete() — no charges, no reportUrl.
   * Body: { result, notes?, referenceRange?, isCritical? }
   */
  async enterResult(id: number | string, payload: EnterLabResultPayload): Promise<LabTestDto> {
    const { data } = await api.patch<LabTestDto>(`/api/lab-tests/${id}/result`, {
      result: payload.result,
      notes: payload.notes ?? null,
      referenceRange: payload.referenceRange ?? null,
      isCritical: payload.isCritical ?? false,
    });
    return data;
  },

  /** DELETE /api/lab-tests/{id} — returns 204 No Content */
  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/lab-tests/${id}`);
  },
};

export default labTestService;
