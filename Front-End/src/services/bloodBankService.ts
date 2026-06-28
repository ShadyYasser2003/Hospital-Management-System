/**
 * bloodBankService.ts
 *
 * Integrates with the new backend Blood Bank API:
 *   /api/blood-bank/units    — inventory management
 *   /api/blood-bank/requests — blood request lifecycle
 *
 * Security (mirrors backend SecurityConfig):
 *   Units    → ADMIN, TECHNICIAN
 *   Requests → ADMIN, DOCTOR, TECHNICIAN
 */

import api from '@/lib/api';

// ─── DTOs (mirror backend BloodUnitDto / BloodRequestDto) ────────────────────

export interface BloodUnitDto {
  id: number;
  /** e.g. "A_POSITIVE", "O_NEGATIVE" */
  bloodType: string;
  /** Number of units in this batch */
  quantity: number;
  /** "yyyy-MM-dd" */
  expiryDate?: string;
  /** AVAILABLE | RESERVED | USED | EXPIRED */
  status: string;
  notes?: string;
}

export interface BloodRequestDto {
  id: number;
  patientId: number;
  patientName: string;
  requestedById: number;
  requestedByName: string;
  /** e.g. "A_POSITIVE" */
  bloodType: string;
  quantity: number;
  /** LOW | MEDIUM | HIGH */
  urgency: string;
  /** PENDING | RESERVED | COMPLETED | CANCELLED */
  status: string;
  notes?: string;
  /** "yyyy-MM-dd HH:mm" */
  fulfilledAt?: string;
  /** "yyyy-MM-dd HH:mm" */
  createdAt?: string;
}

// ─── Create payloads ──────────────────────────────────────────────────────────

export interface CreateBloodUnitPayload {
  bloodType: string;
  quantity: number;
  expiryDate?: string;
  notes?: string;
}

export interface UpdateBloodUnitPayload {
  quantity?: number;
  expiryDate?: string;
  status?: string;
  notes?: string;
}

export interface CreateBloodRequestPayload {
  patientId: number;
  requestedById: number;
  bloodType: string;
  quantity: number;
  urgency?: string;
  notes?: string;
}

// ── Blood Donation DTO ────────────────────────────────────────────────────────

export interface BloodDonationDto {
  id?: number;
  donorName: string;
  donorPhone?: string;
  donorNationalId?: string;
  bloodType: string;
  quantity: number;
  donationDate?: string;
  expiryDate?: string;
  notes?: string;
  /** GENERAL | SPECIFIC_PATIENT */
  donationType: 'GENERAL' | 'SPECIFIC_PATIENT';
  targetPatientId?: number;
  targetPatientName?: string;
  bloodUnitId?: number;
  createdAt?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

const bloodBankService = {
  // ── Blood Units ─────────────────────────────────────────────────────────────

  /** GET /api/blood-bank/units */
  async getAllUnits(): Promise<BloodUnitDto[]> {
    const { data } = await api.get<BloodUnitDto[]>('/api/blood-bank/units');
    return data;
  },

  /** POST /api/blood-bank/units */
  async addUnit(payload: CreateBloodUnitPayload): Promise<BloodUnitDto> {
    const { data } = await api.post<BloodUnitDto>('/api/blood-bank/units', payload);
    return data;
  },

  /** PUT /api/blood-bank/units/{id} */
  async updateUnit(id: number | string, payload: UpdateBloodUnitPayload): Promise<BloodUnitDto> {
    const { data } = await api.put<BloodUnitDto>(`/api/blood-bank/units/${id}`, payload);
    return data;
  },

  // ── Blood Requests ──────────────────────────────────────────────────────────

  /** GET /api/blood-bank/requests */
  async getAllRequests(): Promise<BloodRequestDto[]> {
    const { data } = await api.get<BloodRequestDto[]>('/api/blood-bank/requests');
    return data;
  },

  /** GET /api/blood-bank/requests/pending */
  async getPendingRequests(): Promise<BloodRequestDto[]> {
    const { data } = await api.get<BloodRequestDto[]>('/api/blood-bank/requests/pending');
    return data;
  },

  /** GET /api/blood-bank/requests/patient/{patientId} */
  async getRequestsByPatient(patientId: number | string): Promise<BloodRequestDto[]> {
    const { data } = await api.get<BloodRequestDto[]>(
      `/api/blood-bank/requests/patient/${patientId}`,
    );
    return data;
  },

  /** POST /api/blood-bank/requests — auto-reserves if stock available */
  async createRequest(payload: CreateBloodRequestPayload): Promise<BloodRequestDto> {
    const { data } = await api.post<BloodRequestDto>('/api/blood-bank/requests', payload);
    return data;
  },

  /** PATCH /api/blood-bank/requests/{id}/fulfill — RESERVED → COMPLETED */
  async fulfillRequest(id: number | string): Promise<BloodRequestDto> {
    const { data } = await api.patch<BloodRequestDto>(
      `/api/blood-bank/requests/${id}/fulfill`,
    );
    return data;
  },

  /** PATCH /api/blood-bank/requests/{id}/cancel — releases reserved units */
  async cancelRequest(id: number | string): Promise<BloodRequestDto> {
    const { data } = await api.patch<BloodRequestDto>(
      `/api/blood-bank/requests/${id}/cancel`,
    );
    return data;
  },

  // ── Blood Donations ─────────────────────────────────────────────────────────

  async recordDonation(payload: BloodDonationDto): Promise<BloodDonationDto> {
    const { data } = await api.post<BloodDonationDto>('/api/blood-bank/donations', payload);
    return data;
  },

  async getAllDonations(): Promise<BloodDonationDto[]> {
    const { data } = await api.get<BloodDonationDto[]>('/api/blood-bank/donations');
    return data;
  },

  async getDonationsByPatient(patientId: number | string): Promise<BloodDonationDto[]> {
    const { data } = await api.get<BloodDonationDto[]>(`/api/blood-bank/donations/patient/${patientId}`);
    return data;
  },
};

export default bloodBankService;