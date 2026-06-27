import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bloodBankService, {
  CreateBloodUnitPayload,
  UpdateBloodUnitPayload,
  CreateBloodRequestPayload,
} from '@/services/bloodBankService';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const BLOOD_UNITS_KEY    = 'bloodUnits';
export const BLOOD_REQUESTS_KEY = 'bloodRequests';

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: [BLOOD_UNITS_KEY] });
  qc.invalidateQueries({ queryKey: [BLOOD_REQUESTS_KEY] });
};

// ─── Blood Unit hooks ─────────────────────────────────────────────────────────

export const useBloodUnits = () =>
  useQuery({
    queryKey: [BLOOD_UNITS_KEY],
    queryFn: bloodBankService.getAllUnits,
  });

export const useAddBloodUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBloodUnitPayload) => bloodBankService.addUnit(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BLOOD_UNITS_KEY] }),
  });
};

export const useUpdateBloodUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBloodUnitPayload }) =>
      bloodBankService.updateUnit(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BLOOD_UNITS_KEY] }),
  });
};

// ─── Blood Request hooks ──────────────────────────────────────────────────────

export const useBloodRequests = () =>
  useQuery({
    queryKey: [BLOOD_REQUESTS_KEY, 'all'],
    queryFn: bloodBankService.getAllRequests,
  });

export const usePendingBloodRequests = () =>
  useQuery({
    queryKey: [BLOOD_REQUESTS_KEY, 'pending'],
    queryFn: bloodBankService.getPendingRequests,
  });

export const useBloodRequestsByPatient = (patientId: number | string | undefined) =>
  useQuery({
    queryKey: [BLOOD_REQUESTS_KEY, 'patient', patientId],
    queryFn: () => bloodBankService.getRequestsByPatient(patientId!),
    enabled: !!patientId,
  });

export const useCreateBloodRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBloodRequestPayload) =>
      bloodBankService.createRequest(payload),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useFulfillBloodRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => bloodBankService.fulfillRequest(id),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useCancelBloodRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => bloodBankService.cancelRequest(id),
    onSuccess: () => invalidateAll(qc),
  });
};
