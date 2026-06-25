import type { LabTestDto } from '@/services/labTestService';
import type { RadiologyOrderDto } from '@/services/radiologyService';
import type { DiagnosticOrder, LabDiagnosticOrder, RadiologyDiagnosticOrder } from '@/types/diagnostic';
import { fmtOrderType } from './diagnosticUtils';

export const normalizeLabTest = (t: LabTestDto): LabDiagnosticOrder => ({
  id:             t.id,
  kind:           'lab',
  patientId:      t.patientId,
  patientName:    t.patientName,
  doctorId:       t.doctorId,
  doctorName:     t.doctorName,
  technicianId:   t.technicianId,
  technicianName: t.technicianName,
  orderLabel:     t.testType,
  description:    t.description,
  subLabel:       t.testName,
  status:         t.status,
  orderedAt:      t.orderedAt,
  completedAt:    t.completedAt,
  resultSummary:  t.result,
  notes:          t.notes,
  isCritical:     t.isCritical,
  source:         t,
});

export const normalizeRadiologyOrder = (r: RadiologyOrderDto): RadiologyDiagnosticOrder => ({
  id:             r.id,
  kind:           'radiology',
  patientId:      r.patientId,
  patientName:    r.patientName,
  doctorId:       r.doctorId,
  doctorName:     r.doctorName,
  technicianId:   r.technicianId,
  technicianName: r.technicianName,
  orderLabel:     fmtOrderType(r.orderType),
  description:    r.clinicalIndication,
  subLabel:       r.bodyPart,
  status:         r.status,
  orderedAt:      r.orderedAt,
  completedAt:    r.completedAt,
  resultSummary:  r.reportFindings,
  notes:          r.notes,
  isCritical:     r.isCritical,
  source:         r,
});

export const normalizeLabTests        = (ts: LabTestDto[]):        LabDiagnosticOrder[]        => ts.map(normalizeLabTest);
export const normalizeRadiologyOrders = (rs: RadiologyOrderDto[]): RadiologyDiagnosticOrder[]  => rs.map(normalizeRadiologyOrder);

export const mergeDiagnosticOrders = (
  labs: LabTestDto[],
  radiology: RadiologyOrderDto[],
): DiagnosticOrder[] =>
  ([...normalizeLabTests(labs), ...normalizeRadiologyOrders(radiology)] as DiagnosticOrder[])
    .sort((a, b) => (b.orderedAt ?? '').localeCompare(a.orderedAt ?? ''));
