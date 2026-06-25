/**
 * radiologyService.ts
 *
 * Integrates with the NEW backend: GET/POST/PUT/PATCH/DELETE /api/radiology-orders
 *
 * Mirrors the lab test API shape but adds radiology-specific fields:
 *  - orderType      : e.g. "X_RAY", "CT_SCAN", "MRI", "ULTRASOUND"
 *  - bodyPart       : anatomical target
 *  - clinicalIndication
 *  - contrast / specialInstructions
 *  - scheduledAt    : set via PATCH /{id}/schedule
 *  - reportFindings / impression / imageUrl  : set via PATCH /{id}/report
 *
 * Workflow:
 *   create → assign-technician → schedule (optional) → report (enter findings)
 */

import api from '@/lib/api';

// ─── DTO ─────────────────────────────────────────────────────────────────────

export interface RadiologyOrderDto {
  id: number;

  patientId: number;
  patientName: string;

  doctorId: number;
  doctorName: string;

  technicianId?: number;
  technicianName?: string;

  /** e.g. "X_RAY" | "CT_SCAN" | "MRI" | "ULTRASOUND" | "ECHOCARDIOGRAPHY" */
  orderType: string;

  bodyPart?: string;
  clinicalIndication?: string;
  contrast?: string;
  specialInstructions?: string;

  /** PENDING | SCHEDULED | IN_PROGRESS | COMPLETED */
  status: string;

  /** ISO datetime strings */
  orderedAt: string;
  scheduledAt?: string;
  completedAt?: string;

  /** Technician's report fields */
  reportFindings?: string;
  impression?: string;
  imageUrl?: string;
  isCritical?: boolean;
  notes?: string;
}

// ─── Payload for creating a radiology order ──────────────────────────────────

export interface CreateRadiologyOrderPayload {
  patientId: number;
  doctorId: number;
  orderType: string;
  bodyPart?: string;
  clinicalIndication?: string;
  contrast?: string;
  specialInstructions?: string;
}

// ─── Payload for entering the radiology report ───────────────────────────────

export interface EnterRadiologyReportPayload {
  reportFindings: string;
  impression?: string;
  imageUrl?: string;
  isCritical?: boolean;
  notes?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

const radiologyService = {
  /** GET /api/radiology-orders */
  async getAll(): Promise<RadiologyOrderDto[]> {
    const { data } = await api.get<RadiologyOrderDto[]>('/api/radiology-orders');
    return data;
  },

  /** GET /api/radiology-orders/{id} */
  async getById(id: number | string): Promise<RadiologyOrderDto> {
    const { data } = await api.get<RadiologyOrderDto>(`/api/radiology-orders/${id}`);
    return data;
  },

  /** GET /api/radiology-orders/patient/{patientId} */
  async getByPatient(patientId: number | string): Promise<RadiologyOrderDto[]> {
    const { data } = await api.get<RadiologyOrderDto[]>(`/api/radiology-orders/patient/${patientId}`);
    return data;
  },

  /** GET /api/radiology-orders/doctor/{doctorId} */
  async getByDoctor(doctorId: number | string): Promise<RadiologyOrderDto[]> {
    const { data } = await api.get<RadiologyOrderDto[]>(`/api/radiology-orders/doctor/${doctorId}`);
    return data;
  },

  /** GET /api/radiology-orders/technician/{technicianId} */
  async getByTechnician(technicianId: number | string): Promise<RadiologyOrderDto[]> {
    const { data } = await api.get<RadiologyOrderDto[]>(
      `/api/radiology-orders/technician/${technicianId}`,
    );
    return data;
  },

  /** GET /api/radiology-orders/status?status={status} */
  async getByStatus(status: string): Promise<RadiologyOrderDto[]> {
    const { data } = await api.get<RadiologyOrderDto[]>('/api/radiology-orders/status', {
      params: { status },
    });
    return data;
  },

  /** GET /api/radiology-orders/type?orderType={orderType} */
  async getByType(orderType: string): Promise<RadiologyOrderDto[]> {
    const { data } = await api.get<RadiologyOrderDto[]>('/api/radiology-orders/type', {
      params: { orderType },
    });
    return data;
  },

  /** GET /api/radiology-orders/critical */
  async getCritical(): Promise<RadiologyOrderDto[]> {
    const { data } = await api.get<RadiologyOrderDto[]>('/api/radiology-orders/critical');
    return data;
  },

  /** GET /api/radiology-orders/patient/{patientId}/status?status={status} */
  async getByPatientAndStatus(
    patientId: number | string,
    status: string,
  ): Promise<RadiologyOrderDto[]> {
    const { data } = await api.get<RadiologyOrderDto[]>(
      `/api/radiology-orders/patient/${patientId}/status`,
      { params: { status } },
    );
    return data;
  },

  /** POST /api/radiology-orders */
  async create(payload: CreateRadiologyOrderPayload): Promise<RadiologyOrderDto> {
    const { data } = await api.post<RadiologyOrderDto>('/api/radiology-orders', payload);
    return data;
  },

  /** PUT /api/radiology-orders/{id} */
  async update(
    id: number | string,
    payload: Partial<RadiologyOrderDto>,
  ): Promise<RadiologyOrderDto> {
    const { data } = await api.put<RadiologyOrderDto>(`/api/radiology-orders/${id}`, payload);
    return data;
  },

  /**
   * PATCH /api/radiology-orders/{id}/assign-technician?technicianId={technicianId}
   */
  async assignTechnician(
    id: number | string,
    technicianId: number | string,
  ): Promise<RadiologyOrderDto> {
    const { data } = await api.patch<RadiologyOrderDto>(
      `/api/radiology-orders/${id}/assign-technician`,
      null,
      { params: { technicianId } },
    );
    return data;
  },

  /**
   * PATCH /api/radiology-orders/{id}/schedule?scheduledAt={isoString}
   */
  async schedule(id: number | string, scheduledAt: string): Promise<RadiologyOrderDto> {
    const { data } = await api.patch<RadiologyOrderDto>(
      `/api/radiology-orders/${id}/schedule`,
      null,
      { params: { scheduledAt } },
    );
    return data;
  },

  /**
   * PATCH /api/radiology-orders/{id}/report
   * Body: { reportFindings, impression?, imageUrl?, isCritical?, notes? }
   */
  async enterReport(
    id: number | string,
    payload: EnterRadiologyReportPayload,
  ): Promise<RadiologyOrderDto> {
    const { data } = await api.patch<RadiologyOrderDto>(`/api/radiology-orders/${id}/report`, {
      reportFindings: payload.reportFindings,
      impression: payload.impression ?? null,
      imageUrl: payload.imageUrl ?? null,
      isCritical: payload.isCritical ?? false,
      notes: payload.notes ?? null,
    });
    return data;
  },

  /** DELETE /api/radiology-orders/{id} — returns 204 No Content */
  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/radiology-orders/${id}`);
  },
};

export default radiologyService;
