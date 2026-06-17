import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import testRequestService, { CreateTestRequestPayload } from '@/services/testRequestService';

export const TEST_REQUESTS_KEY = 'testRequests';

export const useTestRequests = () =>
  useQuery({
    queryKey: [TEST_REQUESTS_KEY],
    queryFn: testRequestService.getAll,
  });

export const useTestRequestsByStatus = (status: string) =>
  useQuery({
    queryKey: [TEST_REQUESTS_KEY, 'status', status],
    queryFn: () => testRequestService.getByStatus(status),
    refetchInterval: 10000, // poll every 10s so technicians see new/taken requests
    staleTime: 5000,        // consider data stale after 5s
  });

export const useTestRequestsByDoctor = (doctorId: number | string | undefined) =>
  useQuery({
    queryKey: [TEST_REQUESTS_KEY, 'doctor', doctorId],
    queryFn: () => testRequestService.getByDoctor(doctorId!),
    enabled: !!doctorId,
  });

export const useTestRequestsByPatient = (patientId: number | string | undefined) =>
  useQuery({
    queryKey: [TEST_REQUESTS_KEY, 'patient', patientId],
    queryFn: () => testRequestService.getByPatient(patientId!),
    enabled: !!patientId,
  });

export const useTestRequestsByTechnician = (technicianId: number | string | undefined, page = 0) =>
  useQuery({
    queryKey: [TEST_REQUESTS_KEY, 'technician', technicianId, page],
    queryFn: () => testRequestService.getByTechnician(technicianId!, page),
    enabled: !!technicianId,
  });

export const useCreateTestRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTestRequestPayload) => testRequestService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEST_REQUESTS_KEY] }),
  });
};

export const useAcknowledgeTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => testRequestService.acknowledge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEST_REQUESTS_KEY] }),
  });
};

export const useStartTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => testRequestService.start(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEST_REQUESTS_KEY] }),
  });
};

export const useCompleteTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, results, reportUrl, charges }: { id: number | string; results: string; reportUrl: string; charges?: number }) =>
      testRequestService.complete(id, results, reportUrl, charges),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEST_REQUESTS_KEY] }),
  });
};

export const useCancelTest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => testRequestService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEST_REQUESTS_KEY] }),
  });
};

export const useAssignTechnician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: number | string; technicianId: number | string }) =>
      testRequestService.assignTechnician(id, technicianId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEST_REQUESTS_KEY] }),
  });
};

/** Technician self-assigns (takes) a pending request */
export const useTakeRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: number | string; technicianId: number | string }) =>
      testRequestService.assignTechnician(id, technicianId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEST_REQUESTS_KEY] }),
  });
};
