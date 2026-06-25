/**
 * diagnosticUtils.ts
 *
 * Shared utilities for the lab-test and radiology-order domain.
 * Centralises all repeated logic so pages stay thin.
 *
 * Covers:
 *  - Date / datetime formatting
 *  - Status normalisation
 *  - Critical-flag helpers
 *  - Form validation
 *  - Type-guard predicates
 *  - Order-type display labels
 */

import type { LabTestDto, EnterLabResultPayload } from '@/services/labTestService';
import type { RadiologyOrderDto, EnterRadiologyReportPayload } from '@/services/radiologyService';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Formats a date string from the backend to "yyyy-MM-dd".
 * Backend uses "yyyy-MM-dd HH:mm" (space separator, no T).
 * Also handles ISO format "yyyy-MM-ddTHH:mm:ss" just in case.
 * Returns "—" for null/undefined.
 */
export const fmtDate = (iso?: string | null): string => {
  if (!iso) return '—';
  // Both space and T separators — take only the date part
  const datePart = iso.split('T')[0].split(' ')[0];
  return datePart || '—';
};

// ─── Status helpers ───────────────────────────────────────────────────────────

/** Normalise any status string to uppercase for comparison. Never throws. */
export const normStatus = (s?: string | null): string => s?.toUpperCase() ?? '';

export const isCompleted  = (item: { status?: string | null }) => normStatus(item.status) === 'COMPLETED';
/** Matches both PENDING (frontend) and ORDERED (backend initial status). */
export const isPending    = (item: { status?: string | null }) =>
  ['PENDING', 'ORDERED'].includes(normStatus(item.status));
export const isInProgress = (item: { status?: string | null }) =>
  ['IN_PROGRESS', 'SCHEDULED'].includes(normStatus(item.status));

export const isActiveLab = (t: LabTestDto) =>
  ['PENDING', 'ORDERED', 'IN_PROGRESS', 'SAMPLE_COLLECTED'].includes(normStatus(t.status));

export const isActiveRadiology = (r: RadiologyOrderDto) =>
  ['PENDING', 'ORDERED', 'SCHEDULED', 'IN_PROGRESS'].includes(normStatus(r.status));

// ─── Order-type display ───────────────────────────────────────────────────────

/** "CT_SCAN" → "CT SCAN". Falls back to the raw string. */
export const fmtOrderType = (raw?: string | null): string =>
  raw ? raw.replace(/_/g, ' ') : '—';

// ─── Critical helpers ─────────────────────────────────────────────────────────

/** True when the item is flagged critical and that flag is truthy. */
export const isCriticalItem = (item: { isCritical?: boolean | null }) =>
  item.isCritical === true;

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  /** Human-readable error message, or undefined if valid. */
  error?: string;
}

export const validateLabResultPayload = (
  payload: EnterLabResultPayload,
): ValidationResult => {
  if (!payload.result?.trim()) {
    return { valid: false, error: 'Result is required' };
  }
  return { valid: true };
};

export const validateRadiologyReportPayload = (
  payload: EnterRadiologyReportPayload,
): ValidationResult => {
  if (!payload.reportFindings?.trim()) {
    return { valid: false, error: 'Report findings are required' };
  }
  if (payload.imageUrl && !isValidUrl(payload.imageUrl)) {
    return { valid: false, error: 'Image URL must be a valid URL (https://…)' };
  }
  return { valid: true };
};

export const validateCreateLabTest = (params: {
  patientId: string | number;
  testType: string;
}): ValidationResult => {
  if (!params.patientId) return { valid: false, error: 'Select a patient' };
  if (!params.testType?.trim()) return { valid: false, error: 'Select a test type' };
  return { valid: true };
};

export const validateCreateRadiologyOrder = (params: {
  patientId: string | number;
  orderType: string;
}): ValidationResult => {
  if (!params.patientId) return { valid: false, error: 'Select a patient' };
  if (!params.orderType?.trim()) return { valid: false, error: 'Select an order type' };
  return { valid: true };
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

// ─── Derived list helpers (used by technician pages) ─────────────────────────

/**
 * From the technician's assigned list, return only items that are not yet done.
 * Excludes items whose ID already appears in the "available/pending" list so we
 * don't double-count self-assigned items.
 */
export const filterAvailableLabs = (
  pending: LabTestDto[],
  myIds: Set<number>,
): LabTestDto[] => pending.filter(t => !myIds.has(t.id));

export const filterAvailableRadiology = (
  pending: RadiologyOrderDto[],
  myIds: Set<number>,
): RadiologyOrderDto[] => pending.filter(r => !myIds.has(r.id));

// ─── Default form values ──────────────────────────────────────────────────────
// Centralised so every component that needs these uses the same object shape.

export interface LabResultFormValues {
  result: string;
  notes: string;
  referenceRange: string;
  isCritical: boolean;
}

export interface RadiologyReportFormValues {
  reportFindings: string;
  impression: string;
  imageUrl: string;
  isCritical: boolean;
  notes: string;
}

export const defaultLabResultForm: LabResultFormValues = {
  result: '',
  notes: '',
  referenceRange: '',
  isCritical: false,
};

export const defaultRadiologyReportForm: RadiologyReportFormValues = {
  reportFindings: '',
  impression: '',
  imageUrl: '',
  isCritical: false,
  notes: '',
};

/** Populate a result form from an existing completed LabTestDto. */
export const labResultFormFromDto = (dto: LabTestDto): LabResultFormValues => ({
  result: dto.result ?? '',
  notes: dto.notes ?? '',
  referenceRange: dto.referenceRange ?? '',
  isCritical: dto.isCritical ?? false,
});

/** Populate a report form from an existing completed RadiologyOrderDto. */
export const radiologyReportFormFromDto = (dto: RadiologyOrderDto): RadiologyReportFormValues => ({
  reportFindings: dto.reportFindings ?? '',
  impression: dto.impression ?? '',
  imageUrl: dto.imageUrl ?? '',
  isCritical: dto.isCritical ?? false,
  notes: dto.notes ?? '',
});
