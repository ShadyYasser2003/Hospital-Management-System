import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import labTestService, { CreateLabTestPayload, EnterLabResultPayload } from '@/services/labTestService';

export const LAB_TESTS_KEY = 'labTests';

export const useLabTests = () =>
  useQuery({ queryKey: [LAB_TESTS_KEY], queryFn: labTestService.getAll });

export const useLabTestById = (id: number | string | undefined) =>
  useQuery({ queryKey: [LAB_TESTS_KEY, id], queryFn: () => labTestService.getById(id!), enabled: !!id });

export const useLabTestsByDoctor = (doctorId: number | string | undefined) =>
  useQuery({ queryKey: [LAB_TESTS_KEY, 'doctor', doctorId], queryFn: () => labTestService.getByDoctor(doctorId!), enabled: !!doctorId });

export const useLabTestsByPatient = (patientId: number | string | undefined) =>
  useQuery({ queryKey: [LAB_TESTS_KEY, 'patient', patientId], queryFn: () => labTestService.getByPatient(patientId!), enabled: !!patientId });

export const useLabTestsByTechnician = (technicianId: number | string | undefined) =>
  useQuery({
    queryKey: [LAB_TESTS_KEY, 'technician', technicianId],
    queryFn: () => labTestService.getByTechnician(technicianId!),
    enabled: !!technicianId,
  });

export const useLabTestsByStatus = (status: string) =>
  useQuery({
    queryKey: [LAB_TESTS_KEY, 'status', status],
    queryFn: () => labTestService.getByStatus(status),
  });

export const useCriticalLabTests = () =>
  useQuery({ queryKey: [LAB_TESTS_KEY, 'critical'], queryFn: labTestService.getCritical });

const invalidateLab = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: [LAB_TESTS_KEY] });

export const useCreateLabTest = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (p: CreateLabTestPayload) => labTestService.create(p), onSuccess: () => invalidateLab(qc) });
};

export const useAssignLabTechnician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: number | string; technicianId: number | string }) =>
      labTestService.assignTechnician(id, technicianId),
    onSuccess: () => invalidateLab(qc),
  });
};

export const useEnterLabResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: EnterLabResultPayload }) =>
      labTestService.enterResult(id, payload),
    onSuccess: () => invalidateLab(qc),
  });
};

export const useDeleteLabTest = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => labTestService.delete(id), onSuccess: () => invalidateLab(qc) });
};

/** @deprecated Use useAssignLabTechnician — will be removed in next cleanup pass */
export const useTakeLabTest = useAssignLabTechnician;
