import { useMemo } from 'react';
import { useLabTestsByDoctor, useLabTestsByTechnician, useLabTestsByStatus, useLabTests } from './useLabTests';
import { useRadiologyOrdersByDoctor, useRadiologyOrdersByTechnician, useRadiologyOrdersByStatus, useRadiologyOrders } from './useRadiologyOrders';
import { mergeDiagnosticOrders, normalizeLabTests, normalizeRadiologyOrders } from '@/lib/diagnosticNormalizer';
import { normStatus, isCriticalItem, isCompleted, isPending, isInProgress } from '@/lib/diagnosticUtils';
import type { DiagnosticOrder } from '@/types/diagnostic';

// ─── Filters ──────────────────────────────────────────────────────────────────

export const filterDiagnostic = {
  pending:    (orders: DiagnosticOrder[]) => orders.filter(isPending),
  completed:  (orders: DiagnosticOrder[]) => orders.filter(isCompleted),
  inProgress: (orders: DiagnosticOrder[]) => orders.filter(isInProgress),
  critical:   (orders: DiagnosticOrder[]) => orders.filter(isCriticalItem),
  active:     (orders: DiagnosticOrder[]) => orders.filter(o => !isCompleted(o)),
  byStatus:   (orders: DiagnosticOrder[], status: string) =>
    orders.filter(o => normStatus(o.status) === status.toUpperCase()),
};

// ─── All orders (admin / global views) ───────────────────────────────────────

export const useAllDiagnosticOrders = () => {
  const { data: labs = [],    isLoading: ldLab, error: errLab } = useLabTests();
  const { data: rad  = [],    isLoading: ldRad, error: errRad } = useRadiologyOrders();

  const orders = useMemo(() => mergeDiagnosticOrders(labs, rad), [labs, rad]);

  return {
    orders,
    isLoading: ldLab || ldRad,
    error:     errLab ?? errRad ?? null,
  };
};

// ─── By doctor ────────────────────────────────────────────────────────────────

export const useDiagnosticOrdersByDoctor = (doctorId: number | string | undefined) => {
  const { data: labs = [],  isLoading: ldLab, error: errLab } = useLabTestsByDoctor(doctorId);
  const { data: rad  = [],  isLoading: ldRad, error: errRad } = useRadiologyOrdersByDoctor(doctorId);

  const orders   = useMemo(() => mergeDiagnosticOrders(labs, rad), [labs, rad]);
  const pending  = useMemo(() => filterDiagnostic.pending(orders),   [orders]);
  const completed = useMemo(() => filterDiagnostic.completed(orders), [orders]);
  const critical  = useMemo(() => filterDiagnostic.critical(orders),  [orders]);

  return {
    orders,
    pending,
    completed,
    critical,
    isLoading: ldLab || ldRad,
    error:     errLab ?? errRad ?? null,
  };
};

// ─── By technician (assigned work + available) ────────────────────────────────

export const useDiagnosticOrdersByTechnician = (technicianId: number | string | undefined) => {
  const { data: myLabs = [],    isLoading: ldMyLab,   refetch: refetchMyLabs }  = useLabTestsByTechnician(technicianId);
  const { data: myRad  = [],    isLoading: ldMyRad,   refetch: refetchMyRad }   = useRadiologyOrdersByTechnician(technicianId);
  // Backend uses ORDERED (not PENDING) as the initial/unassigned status
  const { data: pendLabs = [],  isLoading: ldPendLab, refetch: refetchPendLabs } = useLabTestsByStatus('ORDERED');
  const { data: pendRad  = [],  isLoading: ldPendRad, refetch: refetchPendRad }  = useRadiologyOrdersByStatus('ORDERED');

  const myOrders = useMemo(() => mergeDiagnosticOrders(myLabs, myRad), [myLabs, myRad]);

  const myIds = useMemo(
    () => new Set(myOrders.map(o => `${o.kind}:${o.id}`)),
    [myOrders],
  );

  const available = useMemo(
    () =>
      mergeDiagnosticOrders(pendLabs, pendRad).filter(
        o => !myIds.has(`${o.kind}:${o.id}`),
      ),
    [pendLabs, pendRad, myIds],
  );

  const active    = useMemo(() => filterDiagnostic.active(myOrders),    [myOrders]);
  const completed = useMemo(() => filterDiagnostic.completed(myOrders), [myOrders]);

  const refetchAll = () => {
    refetchMyLabs(); refetchMyRad();
    refetchPendLabs(); refetchPendRad();
  };

  return {
    myOrders,
    available,
    active,
    completed,
    isLoading: ldMyLab || ldMyRad || ldPendLab || ldPendRad,
    refetchAll,
  };
};

// ─── By status (global polling — technician "available" view) ─────────────────

export const useDiagnosticOrdersByStatus = (status: string) => {
  const { data: labs = [], isLoading: ldLab } = useLabTestsByStatus(status);
  const { data: rad  = [], isLoading: ldRad } = useRadiologyOrdersByStatus(status);

  const orders = useMemo(() => mergeDiagnosticOrders(labs, rad), [labs, rad]);

  return { orders, isLoading: ldLab || ldRad };
};
