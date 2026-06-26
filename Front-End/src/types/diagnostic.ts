import type { LabTestDto } from '@/services/labTestService';
import type { RadiologyOrderDto } from '@/services/radiologyService';

export type DiagnosticKind = 'lab' | 'radiology';

/**
 * Normalised shape that works for both lab tests and radiology orders.
 * Use `kind` to disambiguate and `source` to access the original DTO.
 */
export interface DiagnosticOrder {
  id: number;
  kind: DiagnosticKind;

  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  technicianId?: number;
  technicianName?: string;

  /** Lab: testType. Radiology: orderType (underscores replaced). */
  orderLabel: string;
  /** Lab: description. Radiology: clinicalIndication. */
  description?: string;
  /** Lab: testName. Radiology: bodyPart. */
  subLabel?: string;

  status: string;
  orderedAt: string;
  completedAt?: string;

  /** Lab: result. Radiology: reportFindings. */
  resultSummary?: string;
  /** Lab: notes. Radiology: notes. */
  notes?: string;
  isCritical?: boolean;

  source: LabTestDto | RadiologyOrderDto;
}

export type LabDiagnosticOrder    = DiagnosticOrder & { kind: 'lab';       source: LabTestDto };
export type RadiologyDiagnosticOrder = DiagnosticOrder & { kind: 'radiology'; source: RadiologyOrderDto };
